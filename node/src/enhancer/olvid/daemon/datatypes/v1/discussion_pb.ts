import OlvidClient from ".././../../../../OlvidClient";
import { Message as Message_, MessageEphemerality, MessageFilter } from "../../../../../gen/olvid/daemon/datatypes/v1/message_pb";
import { Discussion, DiscussionSettings } from "../../../../../gen/olvid/daemon/datatypes/v1/discussion_pb";
import { Contact } from "../../../../../gen/olvid/daemon/datatypes/v1/contact_pb";
import { Group } from "../../../../../gen/olvid/daemon/datatypes/v1/group_pb";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedDiscussion extends Discussion {
    /**
     * Checks if this is a contact (one-to-one) discussion
     * @returns True if this is a contact discussion, false otherwise
     */
    public isContactDiscussion(): boolean {
        return this.identifier.case === "contactId" && this.identifier.value !== BigInt(0);
    }

    /**
     * Checks if this is a group discussion
     * @returns True if this is a group discussion, false otherwise
     */
    public isGroupDiscussion(): boolean {
        return this.identifier.case === "groupId" && this.identifier.value !== BigInt(0);
    }

    /**
     * Checks if messages can be posted to this discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves to true if messages can be posted, false otherwise
     */
    public async canPostMessage(client: OlvidClient) {
        if (this.isContactDiscussion()) {
            return (await this.getContact(client)).canSendMessage()
        }
        else if (this.isGroupDiscussion()) {
            return (await this.getGroup(client)).canSendMessage();
        }
        // locked discussions case
        else {
            return false;
        }
    }

    /**
     * Gets the contact associated with this discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the contact object
     * @throws Error if this is not a contact discussion
     */
    public async getContact(client: OlvidClient): Promise<Contact> {
        if (!this.isContactDiscussion()) {
            throw new Error("Cannot get contact, not a contact discussion")
        }
        return await client.contactGet({contactId: this.identifier.value!})
    }

    /**
     * Gets the group associated with this discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the group object
     * @throws Error if this is not a group discussion
     */
    public async getGroup(client: OlvidClient): Promise<Group> {
        if (!this.isGroupDiscussion()) {
            throw new Error("Cannot get group, not a group discussion")
        }
        return await client.groupGet({groupId: this.identifier.value!})
    }

    /**
     * Posts a message to this discussion
     * @param client - The Olvid client instance
     * @param body - The text content of the message
     * @param options - Optional message settings
     * @param options.attachments - Array of file attachments to include
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the sent message
     */
    public async postMessage(client: OlvidClient, body: string, options?: {attachments?: {filename: string, payload: Uint8Array}[], disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}): Promise<Message_> {
        if (options?.attachments) {
            return (await client.messageSendWithAttachments({
                discussionId: this.id,
                body: body,
                attachments: options.attachments,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })).message
        }
        else {
            return await client.messageSend({
                discussionId: this.id,
                body: body,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })
        }
    }

    /**
     * Empties all messages from this discussion
     * @param client - The Olvid client instance
     * @param deleteEverywhere - Whether to delete messages for all participants (default: false)
     * @returns Promise that resolves when the discussion is emptied
     */
    public async emptyDiscussion(client: OlvidClient, deleteEverywhere: boolean = false): Promise<void> {
        await client.discussionEmpty({ discussionId: this.id, deleteEverywhere });
    }

    /**
     * Retrieves the current settings for this discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the discussion settings
     */
    public async getSettings(client: OlvidClient): Promise<DiscussionSettings> {
        return await client.discussionSettingsGet({ discussionId: this.id });
    }

    /**
     * Updates the settings for this discussion
     * @param client - The Olvid client instance
     * @param settings - The new discussion settings to apply
     * @returns Promise that resolves to the updated discussion settings
     */
    public async setSettings(client: OlvidClient, settings: DiscussionSettings): Promise<DiscussionSettings> {
        settings.discussionId = this.id;
        return await client.discussionSettingsSet({ settings });
    }

    /**
     * Waits for the next message to be received in this discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the next received message
     */
    public async waitForNextMessage(client: OlvidClient): Promise<Message_> {
        return new Promise((resolve) => {
            client.onMessageReceived({
                callback: resolve,
                filter: new MessageFilter({
                    discussionId: this.id,
                }),
                count: BigInt(1)
            });
        });
    }
}
