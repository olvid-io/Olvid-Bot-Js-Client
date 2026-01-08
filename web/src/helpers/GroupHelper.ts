import OlvidClient from "../OlvidClient";
import {
    Group,
    MessageEphemerality,
    GroupMemberSchema,
    Message,
    GroupMemberPermissions
} from "../gen/olvid/daemon/datatypes/v1/datatypes";
import {create} from "@bufbuild/protobuf";

export default abstract class GroupHelper {
    /**
     * Checks if the current user can send messages to this group
     * @returns True if the user has permission to send messages, false otherwise
     */
    public static canSendMessage(group: Group): boolean {
        return !!(group.ownPermissions?.sendMessage);
    }

    /**
     * Checks if the current user has admin permissions for this group
     * @returns True if the user has admin permissions, false otherwise
     */
    public static hasAdminPermissions(group: Group): boolean {
        return !!(group.ownPermissions && group.ownPermissions.admin);
    }

    /**
     * Sends a message to this group's discussion
     * @param client - The Olvid client instance\
     * @param group concerned group
     * @param body - The text content of the message
     * @param options - Optional message settings
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the sent message
     * @throws Error if the user doesn't have permission to send messages in this group
     */
    public static async sendMessage(client: OlvidClient, group: Group, body: string, options?: {disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}) : Promise<Message> {
        if (!this.canSendMessage(group)) {
            throw new Error("Cannot send a message in this group");
        }
        const discussionId: bigint = (await client.discussionGetByGroup({groupId: group.id})).id;
        return await client.messageSend({
            discussionId: discussionId,
            body: body,
            disableLinkPreview: options?.disableLinkPreview,
            ephemerality: options?.ephemerality ?? undefined
        })
    }

    /**
     * Leaves this group (removes the current user from the group)
     * @param client - The Olvid client instance\
     * @param group concerned group
     * @returns Promise that resolves to the updated group object
     */
    public static async leave(client: OlvidClient, group: Group): Promise<Group> {
        return await client.groupLeave({groupId: group.id});
    }

    /**
     * Disbands this group (deletes the group entirely - admin only)
     * @param client - The Olvid client instance\
     * @param group concerned group
     * @returns Promise that resolves to the group object
     */
    public static async disband(client: OlvidClient, group: Group): Promise<Group> {
        if (!this.hasAdminPermissions(group)) {
            throw new Error("Cannot add member if you are not admin")
        }
        return await client.groupDisband({groupId: group.id});
    }

    /**
     * Adds new members to this group with specified permissions
     * @param client - The Olvid client instance\
     * @param group concerned group
     * @param contactIds - Array of contact IDs to add to the group
     * @param permissions - Permissions to grant to the new members
     * @returns Promise that resolves to the updated group object
     * @throws Error if the user doesn't have admin permissions
     */
    public static async addMembers(client: OlvidClient, group: Group, contactIds: bigint[], permissions: GroupMemberPermissions): Promise<Group> {
        if (!this.hasAdminPermissions(group)) {
            throw new Error("Cannot add member if you are not admin")
        }
        contactIds.forEach((contactId) => {group.members.push(create(GroupMemberSchema, {contactId: contactId, permissions: permissions}))})
        return await client.groupUpdate({group});
    }

    /**
     * Removes the photo from this group
     * @param client - The Olvid client instance\
     * @param group concerned group
     * @returns Promise that resolves when the photo is removed
     */
    public static async unsetPhoto(client: OlvidClient, group: Group): Promise<void> {
        await client.groupUnsetPhoto({ groupId: group.id });
    }
}
