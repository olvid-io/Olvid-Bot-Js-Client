import OlvidClient from ".././../../../../OlvidClient";
import { Message as Message_, MessageEphemerality, } from "../../../../../gen/olvid/daemon/datatypes/v1/message_pb";
import { Group, GroupMember, GroupMemberPermissions } from "../../../../../gen/olvid/daemon/datatypes/v1/group_pb";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedGroup extends Group {
    /**
     * Checks if the current user can send messages to this group
     * @returns True if the user has permission to send messages, false otherwise
     */
    public canSendMessage(): boolean {
        return !!(this.ownPermissions?.sendMessage);
    }

    /**
     * Checks if the current user has admin permissions for this group
     * @returns True if the user has admin permissions, false otherwise
     */
    public hasAdminPermissions(): boolean {
        return !!(this.ownPermissions && this.ownPermissions.admin);
    }

    /**
     * Sends a message to this group's discussion
     * @param client - The Olvid client instance
     * @param body - The text content of the message
     * @param options - Optional message settings
     * @param options.attachments - Array of file attachments to include
     * @param options.disableLinkPreview - Whether to disable link previews
     * @param options.ephemerality - Message ephemerality settings
     * @returns Promise that resolves to the sent message
     * @throws Error if the user doesn't have permission to send messages in this group
     */
    public async sendMessage(client: OlvidClient, body: string, options?: {attachments?: {filename: string, payload: Uint8Array}[], disableLinkPreview?: boolean, ephemerality?: MessageEphemerality}) : Promise<Message_> {
        if (!this.canSendMessage()) {
            throw new Error("Cannot send a message in this group");
        }
        const discussionId: bigint = (await client.discussionGetByGroup({groupId: this.id})).id;
        if (options?.attachments) {
            return (await client.messageSendWithAttachments({
                discussionId: discussionId,
                body: body,
                attachments: options.attachments,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })).message
        }
        else {
            return await client.messageSend({
                discussionId: discussionId,
                body: body,
                disableLinkPreview: options?.disableLinkPreview,
                ephemerality: options?.ephemerality ?? undefined
            })
        }
    }

    /**
     * Leaves this group (removes the current user from the group)
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the updated group object
     */
    public async leave(client: OlvidClient): Promise<Group> {
        return await client.groupLeave({groupId: this.id});
    }

    /**
     * Disbands this group (deletes the group entirely - admin only)
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the group object
     */
    public async disband(client: OlvidClient): Promise<Group> {
        if (!this.hasAdminPermissions()) {
            throw new Error("Cannot add member if you are not admin")
        }
        return await client.groupDisband({groupId: this.id});
    }

    /**
     * Adds new members to this group with specified permissions
     * @param client - The Olvid client instance
     * @param contactIds - Array of contact IDs to add to the group
     * @param permissions - Permissions to grant to the new members
     * @returns Promise that resolves to the updated group object
     * @throws Error if the user doesn't have admin permissions
     */
    public async addMembers(client: OlvidClient, contactIds: bigint[], permissions: GroupMemberPermissions): Promise<Group> {
        if (!this.hasAdminPermissions()) {
            throw new Error("Cannot add member if you are not admin")
        }
        contactIds.forEach((contactId) => {this.members.push(new GroupMember({contactId: contactId, permissions: permissions}))})
        return await client.groupUpdate({group: this});
    }

    /**
     * Sets a photo for this group
     * @param client - The Olvid client instance
     * @param filePath - Path to the image file to use as the group photo
     * @returns Promise that resolves when the photo is set
     */
    public async setPhoto(client: OlvidClient, filePath: string): Promise<void> {
        await client.groupSetPhoto({ groupId: this.id, filePath: filePath });
    }

    /**
     * Removes the photo from this group
     * @param client - The Olvid client instance
     * @returns Promise that resolves when the photo is removed
     */
    public async unsetPhoto(client: OlvidClient): Promise<void> {
        await client.groupUnsetPhoto({ groupId: this.id });
    }
}