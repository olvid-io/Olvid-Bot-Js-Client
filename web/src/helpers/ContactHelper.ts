import OlvidClient from "../OlvidClient";
import {
    Message,
    Discussion,
    Contact,
    Group,
    MessageEphemerality,
    GroupFilterSchema, GroupMemberFilterSchema, PendingGroupMemberFilterSchema
} from "../gen/olvid/daemon/datatypes/v1/datatypes";
import {create} from "@bufbuild/protobuf";

export default abstract class ContactHelper {
    /**
     * Checks if this contact can receive messages (has a one-to-one discussion)
     * @param contact concerned contact
     * @returns True if messages can be sent to this contact, false otherwise
     */
    public static canSendMessage(contact: Contact): boolean {
        return contact.hasOneToOneDiscussion;
    }

    /**
     * Sends a message to this contact in their one-to-one discussion
     * @param client - The Olvid client instance
     * @param contact concerned contact
     * @param body - The text content of the message
     * @param options - Optional message settings
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the new message
     * @throws Error if the contact doesn't have a one-to-one discussion
     */
    public static async sendMessage(client: OlvidClient, contact: Contact, body: string, options?: {disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}) : Promise<Message> {
        if (!this.canSendMessage(contact)) {
            throw new Error("Cannot send a message to a non one-to-one contact");
        }
        const discussionId: bigint = (await client.discussionGetByContact({contactId: contact.id})).id;
        return await client.messageSend({
            discussionId: discussionId,
            body: body,
            ephemerality: options?.ephemerality
        });
    }

    /**
     * Retrieves the one-to-one discussion with this contact
     * @param client - The Olvid client instance
     * @param contact concerned contact
     * @returns Promise that resolves to the discussion object
     */
    public static async getDiscussion(client: OlvidClient, contact: Contact): Promise<Discussion> {
        return await client.discussionGetByContact({contactId: contact.id});
    }

    /**
     * Gets all groups where this contact is a member or pending member
     * @param client - The Olvid client instance
     * @param contact concerned contact
     * @returns Promise that resolves to an array of groups containing this contact
     */
    public static async getGroups(client: OlvidClient, contact: Contact): Promise<Array<Group>> {
        const groups: Group[] = [];
        for await (let g of client.groupList({filter: create(GroupFilterSchema, {memberFilters: [create(GroupMemberFilterSchema, {contactId: contact.id})]})})) {
            groups.push(g);
        }
        for await (let g of client.groupList({filter: create(GroupFilterSchema, {pendingMemberFilters: [create(PendingGroupMemberFilterSchema, {contactId: contact.id})]})})) {
            groups.push(g);
        }
        return groups;
    }

    /**
     * Introduces this contact to another contact
     * @param client - The Olvid client instance
     * @param contact concerned contact
     * @param contactId - The ID of the contact to introduce this contact to
     * @returns Promise that resolves when the introduction is complete
     */
    public static async introduce(client: OlvidClient, contact: Contact, contactId: bigint): Promise<void> {
        await client.contactIntroduction({firstContactId: contact.id, secondContactId: contactId});
    }

    /**
     * Invites this contact to a one-to-one discussion
     * @param client - The Olvid client instance
     * @param contact concerned contact
     * @returns Promise that resolves when the invitation is sent
     * @throws Error if the contact already has a one-to-one discussion
     */
    public static async inviteOneToOne(client: OlvidClient, contact: Contact): Promise<void> {
        if (!contact.hasOneToOneDiscussion) {
            throw new Error("Cannot send invitation to an already one-to-one contact");
        }
        await client.contactInviteToOneToOneDiscussion({contactId: contact.id});
    }

    /**
     * Downgrades the one-to-one discussion with this contact
     * @param client - The Olvid client instance
     * @param contact concerned contact
     * @returns Promise that resolves when the downgrade is complete
     */
    public static async downgradeOneToOne(client: OlvidClient, contact: Contact): Promise<void> {
        if (!contact.hasOneToOneDiscussion) {
            throw new Error("Cannot downgrade a non one-to-one contact");
        }
        return await client.contactDowngradeOneToOneDiscussion({contactId: contact.id});
    }

    /**
     * Deletes this contact from the contact list
     * @param client - The Olvid client instance
     * @param contact concerned contact
     * @returns Promise that resolves when the contact is deleted
     */
    public static async delete(client: OlvidClient, contact: Contact): Promise<void> {
        return await client.contactDelete({contactId: contact.id});
    }
}