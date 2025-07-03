import OlvidClient from ".././../../../../OlvidClient";
import { Message, MessageEphemerality, MessageFilter, MessageId, MessageId_Type } from "../../../../../gen/olvid/daemon/datatypes/v1/message_pb";
import { Attachment, AttachmentFilter } from "../../../../../gen/olvid/daemon/datatypes/v1/attachment_pb";
import { Discussion } from "../../../../../gen/olvid/daemon/datatypes/v1/discussion_pb";
import { Contact } from "../../../../../gen/olvid/daemon/datatypes/v1/contact_pb";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedMessage extends Message{
    /**
     * Checks if this is an inbound message (received from another user)
     * @returns True if the message is inbound, false if outbound
     */
    public isInbound(): boolean {
        return this.senderId !== BigInt(0);
    }

    /**
     * Checks if this is an outbound message (sent by the current user)
     * @returns True if the message is outbound, false if inbound
     */
    public isOutbound(): boolean {
        return this.senderId === BigInt(0);
    }

    /**
     * Checks if this message is in a one-to-one (contact) discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves to true if this is a one-to-one message, false otherwise
     */
    public async isOneToOneMessage(client: OlvidClient): Promise<boolean> {
        const discussion = await client.discussionGet({ discussionId: this.discussionId });
        return discussion.identifier.case === "contactId" && discussion.identifier.value !== BigInt(0);
    }

    /**
     * Checks if this message is in a group discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves to true if this is a group message, false otherwise
     */
    public async isGroupMessage(client: OlvidClient): Promise<boolean> {
        const discussion = await client.discussionGet({ discussionId: this.discussionId });
        return discussion.identifier.case === "groupId" && discussion.identifier.value !== BigInt(0);
    }

    /**
     * Gets the discussion this message belongs to
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the discussion object
     */
    public async getDiscussion(client: OlvidClient): Promise<Discussion> {
        return await client.discussionGet({ discussionId: this.discussionId });
    }

    /**
     * Gets the contact who sent this message (only for inbound messages)
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the sender contact
     * @throws Error if this is an outbound message
     */
    public async getSenderContact(client: OlvidClient): Promise<Contact> {
        if (!this.isInbound()) {
            throw new Error("Cannot get_sender_contact of outbound message");
        }
        return await client.contactGet({ contactId: this.senderId });
    }

    /**
     * Replies to this message in the same discussion
     * @param client - The Olvid client instance
     * @param body - The text content of the reply
     * @param options - Optional reply settings
     * @param options.attachments - Array of file attachments to include
     * @param options.quote - Whether to quote/reference the original message
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the sent reply message
     */
    public async reply(client: OlvidClient, body: string, options?: {attachments?: {filename: string, payload: Uint8Array}[], quote?: boolean, disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}) : Promise<Message> {
        if (options?.attachments) {
            return (await client.messageSendWithAttachments({
                discussionId: this.discussionId,
                body: body,
                attachments: options.attachments,
                replyId: options?.quote ? this.id : undefined,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })).message
        }
        else {
            return await client.messageSend({
                discussionId: this.discussionId,
                body: body,
                replyId: options?.quote ? this.id : undefined,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })
        }
    }

    /**
     * Gets all attachments associated with this message
     * @param client - The Olvid client instance
     * @returns Promise that resolves to an array of attachment objects
     */
    public async getAttachments(client: OlvidClient): Promise<Attachment[]> {
        const attachments: Attachment[] = []
        const filter = new AttachmentFilter({ messageId: this.id });
        for await (let a of client.attachmentList({ filter })) {
            attachments.push(a);
        }
        return attachments;
    }

    /**
     * Deletes this message
     * @param client - The Olvid client instance
     * @param deleteEverywhere - Whether to delete the message for all participants (default: false)
     * @returns Promise that resolves when the message is deleted
     */
    public async delete(client: OlvidClient, deleteEverywhere: boolean = false): Promise<void> {
        await client.messageDelete({ messageId: this.id!, deleteEverywhere });
    }

    /**
     * Edits the text content of this message
     * @param client - The Olvid client instance
     * @param newBody - The new text content for the message
     * @returns Promise that resolves when the message is edited
     */
    public async editBody(client: OlvidClient, newBody: string): Promise<void> {
        await client.messageUpdateBody({ messageId: this.id!, updatedBody: newBody });
    }

    /**
     * Adds a reaction (emoji) to this message
     * @param client - The Olvid client instance
     * @param reaction - The emoji or reaction string to add
     * @returns Promise that resolves when the reaction is added
     */
    public async react(client: OlvidClient, reaction: string): Promise<void> {
        await client.messageReact({messageId: this.id!, reaction: reaction})
    }

    /**
     * Removes the current user's reaction from this message
     * @param client - The Olvid client instance
     * @returns Promise that resolves when the reaction is removed
     */
    public async removeReaction(client: OlvidClient): Promise<void> {
        await client.messageReact({ messageId: this.id!, reaction: "" });
    }

    /**
     * Collection of methods to wait for specific message events (one-time listeners)
     */
    public waitFor = {
        /**
         * Waits for this outbound message to be uploaded to the server
         * @param client - The Olvid client instance
         * @returns Promise that resolves when the message is uploaded
         * @throws Error if called on an inbound message
         */
        messageToBeUploaded: (client: OlvidClient): Promise<void> => {
            if (!this.isOutbound()) {
                throw new Error("Cannot wait for an inbound message to be uploaded");
            }
            return new Promise((resolve) => {
                client.onMessageUploaded({
                    callback: () => resolve(),
                    messageIds: [this.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for this outbound message to be delivered to recipients
         * @param client - The Olvid client instance
         * @returns Promise that resolves when the message is delivered
         * @throws Error if called on an inbound message
         */
        messageToBeDelivered: (client: OlvidClient): Promise<void> => {
            if (!this.isOutbound()) {
                throw new Error("Cannot wait for an inbound message to be delivered");
            }
            return new Promise((resolve) => {
                client.onMessageDelivered({
                    callback: () => resolve(),
                    messageIds: [this.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for this outbound message to be read by recipients
         * @param client - The Olvid client instance
         * @returns Promise that resolves when the message is read
         * @throws Error if called on an inbound message
         */
        messageToBeRead: (client: OlvidClient): Promise<void> => {
            if (!this.isOutbound()) {
                throw new Error("Cannot wait for an inbound message to be read");
            }
            return new Promise((resolve) => {
                client.onMessageRead({
                    callback: () => resolve(),
                    messageIds: [this.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for this message to be edited
         * @param client - The Olvid client instance
         * @returns Promise that resolves to a tuple of [updated message, previous body text]
         */
        messageToBeEdited: (client: OlvidClient): Promise<[Message, string]> => {
            return new Promise((resolve) => {
                client.onMessageBodyUpdated({
                    callback: (message: Message, previousBody: string) => {
                        resolve([message, previousBody]);
                    },
                    messageIds: [this.id!],
                    count: BigInt(1)
                });
            });
        },

        /**
         * Waits for a new incoming message, repling to this message
         * @param client - The Olvid client instance
         * @returns Promise that resolves to the reply message when received
         */
        replyToMessage: (client: OlvidClient): Promise<Message> => {
            return new Promise((resolve) => {
                client.onMessageReceived({
                    callback: (message: Message) => {
                        resolve(message);
                    },
                    filter: new MessageFilter({reply: {case: "repliedMessageId", value: this.id!}}),
                    count: BigInt(1)
                });
            });
        }
    };

    /**
     * Collection of methods to set up persistent listeners for message events
     */
    public on = {
        /**
         * Sets up a persistent listener for message upload events
         * @param client - The Olvid client instance
         * @param handler - Callback function to execute when the message is uploaded
         * @returns Function to cancel the event listener
         * @throws Error if called on an inbound message
         */
        messageUploaded: (client: OlvidClient, handler: (message: Message) => Promise<void> | void): Function => {
            if (!this.isOutbound()) {
                throw new Error("Cannot wait for an inbound message to be uploaded");
            }
            return client.onMessageUploaded({
                callback: handler,
                messageIds: [this.id!]
            });
        },

        /**
         * Sets up a persistent listener for message delivery events
         * @param client - The Olvid client instance
         * @param handler - Callback function to execute when the message is delivered
         * @returns Function to cancel the event listener
         * @throws Error if called on an inbound message
         */
        messageDelivered: (client: OlvidClient, handler: (message: Message) => Promise<void> | void): Function => {
            if (!this.isOutbound()) {
                throw new Error("Cannot wait for an inbound message to be delivered");
            }
            return client.onMessageDelivered({
                callback: handler,
                messageIds: [this.id!]
            });
        },

        /**
         * Sets up a persistent listener for message read events
         * @param client - The Olvid client instance
         * @param handler - Callback function to execute when the message is read
         * @returns Function to cancel the event listener
         * @throws Error if called on an inbound message
         */
        messageRead: (client: OlvidClient, handler: (message: Message) => Promise<void> | void): Function => {
            if (!this.isOutbound()) {
                throw new Error("Cannot wait for an inbound message to be read");
            }
            return client.onMessageRead({
                callback: handler,
                messageIds: [this.id!]
            });
        },

        /**
         * Sets up a persistent listener for message edit events
         * @param client - The Olvid client instance
         * @param handler - Callback function to execute when the message is edited
         * @returns Function to cancel the event listener
         */
        messageEdited: (client: OlvidClient, handler: (message: Message, previousBody: string) => Promise<void> | void): Function => {
            return client.onMessageBodyUpdated({
                callback: handler,
                messageIds: [this.id!]
            });
        },
    };
}

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedMessageId extends MessageId {
    /**
     * Returns a string representation of the message ID
     * @returns A string in the format "I{id}" for inbound messages or "O{id}" for outbound messages
     */
    public toString(): string {
        return `${this.type === MessageId_Type.INBOUND ? 'I' : 'O'}${this.id}`;
    }
}
