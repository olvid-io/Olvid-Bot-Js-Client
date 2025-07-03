import OlvidClient from ".././../../../../OlvidClient";
import { Message as Message_, MessageEphemerality } from "../../../../../gen/olvid/daemon/datatypes/v1/message_pb";
import { Discussion } from "../../../../../gen/olvid/daemon/datatypes/v1/discussion_pb";
import { Contact as Contact } from "../../../../../gen/olvid/daemon/datatypes/v1/contact_pb";
import { Group, GroupFilter, GroupMemberFilter, PendingGroupMemberFilter } from "../../../../../gen/olvid/daemon/datatypes/v1/group_pb";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedContact extends Contact {
    /**
     * Checks if this contact can receive messages (has a one-to-one discussion)
     * @returns True if messages can be sent to this contact, false otherwise
     */
    public canSendMessage(): boolean {
        return this.hasOneToOneDiscussion;
    }

    /**
     * Sends a message to this contact in their one-to-one discussion
     * @param client - The Olvid client instance
     * @param body - The text content of the message
     * @param options - Optional message settings
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the sent message
     * @throws Error if the contact doesn't have a one-to-one discussion
     */
    public async sendMessage(client: OlvidClient, body: string, options?: {disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}) : Promise<Message_> {
        if (!this.canSendMessage()) {
            throw new Error("Cannot send a message to a non one-to-one contact");
        }
        const discussionId: bigint = (await client.discussionGetByContact({contactId: this.id})).id;
        return await client.messageSend({
            discussionId: discussionId,
            body: body,
            ephemerality: options?.ephemerality
        });
    }

    /**
     * Retrieves the one-to-one discussion with this contact
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the discussion object
     */
    public async getDiscussion(client: OlvidClient): Promise<Discussion> {
        return await client.discussionGetByContact({contactId: this.id});
    }

    /**
     * Gets all groups where this contact is a member or pending member
     * @param client - The Olvid client instance
     * @returns Promise that resolves to an array of groups containing this contact
     */
    public async getGroups(client: OlvidClient): Promise<Array<Group>> {
        const groups: Group[] = [];
        for await (let g of client.groupList({filter: new GroupFilter({memberFilters: [new GroupMemberFilter({contactId: this.id})]})})) {
            groups.push(g);
        }
        for await (let g of client.groupList({filter: new GroupFilter({pendingMemberFilters: [new PendingGroupMemberFilter({contactId: this.id})]})})) {
            groups.push(g);
        }
        return groups;
    }

    /**
     * Introduces this contact to another contact
     * @param client - The Olvid client instance
     * @param contactId - The ID of the contact to introduce this contact to
     * @returns Promise that resolves when the introduction is complete
     */
    public async introduce(client: OlvidClient, contactId: bigint): Promise<void> {
        await client.contactIntroduction({firstContactId: this.id, secondContactId: contactId});
    }

    /**
     * Invites this contact to a one-to-one discussion
     * @param client - The Olvid client instance
     * @returns Promise that resolves when the invitation is sent
     * @throws Error if the contact already has a one-to-one discussion
     */
    public async inviteOneToOne(client: OlvidClient): Promise<void> {
        if (!this.hasOneToOneDiscussion) {
            throw new Error("Cannot send invitation to an already one-to-one contact");
        }
        await client.contactInviteToOneToOneDiscussion({contactId: this.id});
    }

    /**
     * Downgrades the one-to-one discussion with this contact
     * @param client - The Olvid client instance
     * @returns Promise that resolves when the downgrade is complete
     */
    public async downgradeOneToOne(client: OlvidClient): Promise<void> {
        if (!this.hasOneToOneDiscussion) {
            throw new Error("Cannot downgrade a non one-to-one contact");
        }
        return await client.contactDowngradeOneToOneDiscussion({contactId: this.id});
    }

    /**
     * Deletes this contact from the contact list
     * @param client - The Olvid client instance
     * @returns Promise that resolves when the contact is deleted
     */
    public async delete(client: OlvidClient): Promise<void> {
        return await client.contactDelete({contactId: this.id});
    }
}
