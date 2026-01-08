import OlvidClient from "../OlvidClient";
import {
    Message,
    Discussion,
    Attachment,
    Contact,
    MessageEphemerality,
    AttachmentFilterSchema, MessageFilterSchema
} from "../gen/olvid/daemon/datatypes/v1/datatypes";
import {create} from "@bufbuild/protobuf";

export default abstract class MessageHelper {
    /**
     * Checks if this is an inbound message (received from another user)
     * @returns True if the message is inbound, false if outbound
     */
    public static isInbound(message: Message): boolean {
        return message.senderId !== BigInt(0);
    }

    /**
     * Checks if this is an outbound message (sent by the current user)
     * @param message concerned message
     * @returns True if the message is outbound, false if inbound
     */
    public static isOutbound(message: Message): boolean {
        return message.senderId === BigInt(0);
    }

    /**
     * Checks if this message is in a one-to-one (contact) discussion
     * @param client - The Olvid client instance
     * @param message concerned message
     * @returns Promise that resolves to true if this is a one-to-one message, false otherwise
     */
    public static async isOneToOneMessage(client: OlvidClient, message: Message): Promise<boolean> {
        const discussion = await client.discussionGet({ discussionId: message.discussionId });
        return discussion.identifier.case === "contactId" && discussion.identifier.value !== BigInt(0);
    }

    /**
     * Checks if this message is in a group discussion
     * @param client - The Olvid client instance
     * @param message concerned message
     * @returns Promise that resolves to true if this is a group message, false otherwise
     */
    public static async isGroupMessage(client: OlvidClient, message: Message): Promise<boolean> {
        const discussion = await client.discussionGet({ discussionId: message.discussionId });
        return discussion.identifier.case === "groupId" && discussion.identifier.value !== BigInt(0);
    }

    /**
     * Gets the discussion this message belongs to
     * @param client - The Olvid client instance
     * @param message concerned message
     * @returns Promise that resolves to the discussion object
     */
    public static async getDiscussion(client: OlvidClient, message: Message): Promise<Discussion> {
        return await client.discussionGet({ discussionId: message.discussionId });
    }

    /**
     * Gets the contact who sent this message (only for inbound messages)
     * @param client - The Olvid client instance
     * @param message concerned message
     * @returns Promise that resolves to the sender contact
     * @throws Error if this is an outbound message
     */
    public static async getSenderContact(client: OlvidClient, message: Message): Promise<Contact> {
        if (!this.isInbound(message)) {
            throw new Error("Cannot get_sender_contact of outbound message");
        }
        return await client.contactGet({ contactId: message.senderId });
    }

    /**
     * Replies to this message in the same discussion
     * @param client - The Olvid client instance
     * @param message concerned message
     * @param body - The text content of the reply
     * @param options - Optional reply settings
     * @param options.attachments - Array of file attachments to include
     * @param options.quote - Whether to quote/reference the original message
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the reply message
     */
    public static async reply(client: OlvidClient, message: Message, body: string, options?: {quote?: boolean, disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}) : Promise<Message> {
        return await client.messageSend({
            discussionId: message.discussionId,
            body: body,
            replyId: options?.quote ? message.id : undefined,
            disableLinkPreview: options?.disableLinkPreview,
            ephemerality: options?.ephemerality ?? undefined
        })
    }

    /**
     * Gets all attachments associated with this message
     * @param client - The Olvid client        instance
     * @param message concerned message
     * @returns Promise that resolves to an array of attachment objects
     */
    public static async getAttachments(client: OlvidClient, message: Message): Promise<Attachment[]> {
        const attachments: Attachment[] = []
        const filter = create(AttachmentFilterSchema, { messageId: message.id });
        for await (let a of client.attachmentList({ filter })) {
            attachments.push(a);
        }
        return attachments;
    }

    /**
     * Deletes this message
     * @param client - The Olvid client        instance
     * @param message concerned message
     * @param deleteEverywhere - Whether to delete the message for all participants (default: false)
     * @returns Promise that resolves when the message is deleted
     */
    public static async delete(client: OlvidClient, message: Message, deleteEverywhere: boolean = false): Promise<void> {
        await client.messageDelete({ messageId: message.id!, deleteEverywhere });
    }

    /**
     * Edits the text content of this message
     * @param client - The Olvid client        instance
     * @param message concerned message
     * @param newBody - The new text content for the message
     * @returns Promise that resolves when the message is edited
     */
    public static async editBody(client: OlvidClient, message: Message, newBody: string): Promise<void> {
        await client.messageUpdateBody({ messageId: message.id!, updatedBody: newBody });
    }

    /**
     * Adds a reaction (emoji) to this message
     * @param client - The Olvid client        instance
     * @param message concerned message
     * @param reaction - The emoji or reaction string to add
     * @returns Promise that resolves when the reaction is added
     */
    public static async react(client: OlvidClient, message: Message, reaction: string): Promise<void> {
        await client.messageReact({messageId: message.id!, reaction: reaction})
    }

    /**
     * Removes the current user's reaction from this message
     * @param client - The Olvid client        instance
     * @param message concerned message
     * @returns Promise that resolves when the reaction is removed
     */
    public static async removeReaction(client: OlvidClient, message: Message): Promise<void> {
        await client.messageReact({ messageId: message.id!, reaction: "" });
    }

    /**
     * Collection of methods to wait for specific message events (one-time listeners)
     */
    public static waitFor = {
        /**
         * Waits for this outbound message to be uploaded to the server
         * @param client - The Olvid client instance
         * @param message concerned message
         * @returns Promise that resolves when the message is uploaded
         * @throws Error if called on an inbound message
         */
        messageToBeUploaded: (client: OlvidClient, message: Message): Promise<void> => {
            if (!this.isOutbound(message)) {
                throw new Error("Cannot wait for an inbound message to be uploaded");
            }
            return new Promise((resolve) => {
                client.onMessageUploaded({
                    callback: () => resolve(),
                    messageIds: [message.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for this outbound message to be delivered to recipients
         * @param client - The Olvid client instance
         * @param message concerned message
         * @returns Promise that resolves when the message is delivered
         * @throws Error if called on an inbound message
         */
        messageToBeDelivered: (client: OlvidClient, message: Message): Promise<void> => {
            if (!this.isOutbound(message)) {
                throw new Error("Cannot wait for an inbound message to be delivered");
            }
            return new Promise((resolve) => {
                client.onMessageDelivered({
                    callback: () => resolve(),
                    messageIds: [message.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for this outbound message to be read by recipients
         * @param client - The Olvid client instance
         * @param message concerned message
         * @returns Promise that resolves when the message is read
         * @throws Error if called on an inbound message
         */
        messageToBeRead: (client: OlvidClient, message: Message): Promise<void> => {
            if (!this.isOutbound(message)) {
                throw new Error("Cannot wait for an inbound message to be read");
            }
            return new Promise((resolve) => {
                client.onMessageRead({
                    callback: () => resolve(),
                    messageIds: [message.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for this message to be edited
         * @param client - The Olvid client instance
         * @param message concerned message
         * @returns Promise that resolves to a tuple of [updated message, previous body text]
         */
        messageToBeEdited: (client: OlvidClient, message: Message): Promise<[Message, string]> => {
            return new Promise((resolve) => {
                client.onMessageBodyUpdated({
                    callback: (message: Message, previousBody: string) => {
                        resolve([message, previousBody]);
                    },
                    messageIds: [message.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for a new incoming message, repling to this message
         * @param client - The Olvid client instance
         * @param message concerned message
         * @returns Promise that resolves to the reply message when received
         */
        replyToMessage: (client: OlvidClient, message: Message): Promise<Message> => {
            return new Promise((resolve) => {
                client.onMessageReceived({
                    callback: (message: Message) => {
                        resolve(message);
                    },
                    filter: create(MessageFilterSchema, {reply: {case: "repliedMessageId", value: message.id!}}),
                    count: BigInt(1)
                });
            });
        }
    };

    /**
     * Collection of methods to set up persistent listeners for message events
     */
    public static on = {
        /**
         * Sets up a persistent listener for message upload events
         * @param client - The Olvid client instance
         * @param message concerned message
         * @param handler - Callback function to execute when the message is uploaded
         * @returns Function to cancel the event listener
         * @throws Error if called on an inbound message
         */
        messageUploaded: (client: OlvidClient, message: Message, handler: (message: Message) => Promise<void> | void): Function => {
            if (!this.isOutbound(message)) {
                throw new Error("Cannot wait for an inbound message to be uploaded");
            }
            return client.onMessageUploaded({
                callback: handler,
                messageIds: [message.id!]
            });
        },

        /**
         * Sets up a persistent listener for message delivery events
         * @param client - The Olvid client instance
         * @param message concerned message
         * @param handler - Callback function to execute when the message is delivered
         * @returns Function to cancel the event listener
         * @throws Error if called on an inbound message
         */
        messageDelivered: (client: OlvidClient, message: Message, handler: (message: Message) => Promise<void> | void): Function => {
            if (!this.isOutbound(message)) {
                throw new Error("Cannot wait for an inbound message to be delivered");
            }
            return client.onMessageDelivered({
                callback: handler,
                messageIds: [message.id!]
            });
        },

        /**
         * Sets up a persistent listener for message read events
         * @param client - The Olvid client instance
         * @param message concerned message
         * @param handler - Callback function to execute when the message is read
         * @returns Function to cancel the event listener
         * @throws Error if called on an inbound message
         */
        messageRead: (client: OlvidClient, message: Message, handler: (message: Message) => Promise<void> | void): Function => {
            if (!this.isOutbound(message)) {
                throw new Error("Cannot wait for an inbound message to be read");
            }
            return client.onMessageRead({
                callback: handler,
                messageIds: [message.id!]
            });
        },

        /**
         * Sets up a persistent listener for message edit events
         * @param client - The Olvid client instance
         * @param message concerned message
         * @param handler - Callback function to execute when the message is edited
         * @returns Function to cancel the event listener
         */
        messageEdited: (client: OlvidClient, message: Message, handler: (message: Message, previousBody: string) => Promise<void> | void): Function => {
            return client.onMessageBodyUpdated({
                callback: handler,
                messageIds: [message.id!]
            });
        },
    };}