import OlvidClient from "../OlvidClient";
import {
    Discussion,
    Contact,
    MessageEphemerality,
    MessageFilterSchema, Group, Message, DiscussionSettings
} from "../gen/olvid/daemon/datatypes/v1/datatypes";
import {create} from "@bufbuild/protobuf";
import ContactHelper from "./ContactHelper";
import GroupHelper from "./GroupHelper";

export default abstract class DiscussionHelper {
    /**
     * Checks if this is a contact (one-to-one) discussion
     * @returns True if this is a contact discussion, false otherwise
     */
    public static isContactDiscussion(discussion: Discussion): boolean {
        return discussion.identifier.case === "contactId" && discussion.identifier.value !== BigInt(0);
    }

    /**
     * Checks if this is a group discussion
     * @returns True if this is a group discussion, false otherwise
     */
    public static isGroupDiscussion(discussion: Discussion): boolean {
        return discussion.identifier.case === "groupId" && discussion.identifier.value !== BigInt(0);
    }

    /**
     * Checks if messages can be posted to this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @returns Promise that resolves to true if messages can be posted, false otherwise
     */
    public static async canPostMessage(client: OlvidClient, discussion: Discussion) {
        if (this.isContactDiscussion(discussion)) {
            return ContactHelper.canSendMessage(await this.getContact(client, discussion));
        }
        else if (this.isGroupDiscussion(discussion)) {
            return GroupHelper.canSendMessage(await this.getGroup(client, discussion));
        }
        // locked discussions case
        else {
            return false;
        }
    }

    /**
     * Gets the contact associated with this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @returns Promise that resolves to the contact object
     * @throws Error if this is not a contact discussion
     */
    public static async getContact(client: OlvidClient, discussion: Discussion): Promise<Contact> {
        if (!this.isContactDiscussion(discussion)) {
            throw new Error("Cannot get contact, not a contact discussion")
        }
        return await client.contactGet({contactId: discussion.identifier.value!})
    }

    /**
     * Gets the group associated with this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @returns Promise that resolves to the group object
     * @throws Error if this is not a group discussion
     */
    public static async getGroup(client: OlvidClient, discussion: Discussion): Promise<Group> {
        if (!this.isGroupDiscussion(discussion)) {
            throw new Error("Cannot get group, not a group discussion")
        }
        return await client.groupGet({groupId: discussion.identifier.value!})
    }

    /**
     * Posts a message to this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @param body - The text content of the message
     * @param options - Optional message settings
     * @param options.attachments - Array of file attachments to include
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the sent message
     */
    public static async postMessage(client: OlvidClient, discussion: Discussion, body: string, options?: {attachments?: {filename: string, payload: Uint8Array}[], disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}): Promise<Message> {
        if (options?.attachments) {
            return (await client.messageSendWithAttachments({
                discussionId: discussion.id,
                body: body,
                attachments: options.attachments,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })).message
        }
        else {
            return await client.messageSend({
                discussionId: discussion.id,
                body: body,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })
        }
    }

    /**
     * Empties all messages from this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @returns Promise that resolves when the discussion is emptied
     */
    public static async emptyDiscussion(client: OlvidClient, discussion: Discussion): Promise<void> {
        await client.discussionEmpty({ discussionId: discussion.id });
    }

    /**
     * Retrieves the current settings for this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @returns Promise that resolves to the discussion settings
     */
    public static async getSettings(client: OlvidClient, discussion: Discussion): Promise<DiscussionSettings> {
        return await client.settingsDiscussionGet({ discussionId: discussion.id });
    }

    /**
     * Updates the settings for this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @param settings - The new discussion settings to apply
     * @returns Promise that resolves to the updated discussion settings
     */
    public static async setSettings(client: OlvidClient, discussion: Discussion, settings: DiscussionSettings): Promise<DiscussionSettings> {
        settings.discussionId = discussion.id;
        return await client.settingsDiscussionSet({ discussionSettings: settings });
    }

    /**
     * Waits for the next message to be received in this discussion
     * @param client - The Olvid client instance
     * @param discussion concerned discussion
     * @returns Promise that resolves to the next received message
     */
    public static async waitForNextMessage(client: OlvidClient, discussion: Discussion): Promise<Message> {
        return new Promise((resolve) => {
            client.onMessageReceived({
                callback: resolve,
                filter: create(MessageFilterSchema, {discussionId: discussion.id,}),
                count: BigInt(1)
            });
        });
    }
}