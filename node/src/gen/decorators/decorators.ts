import {OlvidClient, datatypes} from '../../olvid';
 import {create} from "@bufbuild/protobuf";

// Custom decorators
export function command(regexp_filter: string) {
  return function <This extends OlvidClient>(
    target: (
      message: datatypes.Message,
      cmd_parameters: string
    ) => Promise<void>,
    context: ClassMethodDecoratorContext<
      This,
      (
        message: datatypes.Message,
        args: string
      ) => Promise<void>
    >
  ) {
    // Build the regex for the command (with optional aliases)
    context.addInitializer(function (this: This) {
      this.onMessageReceived({
        filter: create(datatypes.MessageFilterSchema, { bodySearch: regexp_filter }),
        callback: async (message: datatypes.Message) => {
          const cmd_parameters = message.body.replace(
            new RegExp(regexp_filter),
            ""
          );
          await target.call(this, message, cmd_parameters);
        },
      });
    });
  };
}

// InvitationNotificationService: InvitationReceived
// noinspection JSUnusedGlobalSymbols
export function onInvitationReceived(options?: {count?: bigint, filter?: datatypes.InvitationFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, invitation: datatypes.Invitation) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, invitation: datatypes.Invitation) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onInvitationReceived({
                ...options,
                callback: async (invitation: datatypes.Invitation) => {
                    await target.call(this, invitation);
                },
            });
        });
    };
}


// InvitationNotificationService: InvitationSent
// noinspection JSUnusedGlobalSymbols
export function onInvitationSent(options?: {count?: bigint, filter?: datatypes.InvitationFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, invitation: datatypes.Invitation) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, invitation: datatypes.Invitation) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onInvitationSent({
                ...options,
                callback: async (invitation: datatypes.Invitation) => {
                    await target.call(this, invitation);
                },
            });
        });
    };
}


// InvitationNotificationService: InvitationDeleted
// noinspection JSUnusedGlobalSymbols
export function onInvitationDeleted(options?: {count?: bigint, filter?: datatypes.InvitationFilter, invitationIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, invitation: datatypes.Invitation) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, invitation: datatypes.Invitation) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onInvitationDeleted({
                ...options,
                callback: async (invitation: datatypes.Invitation) => {
                    await target.call(this, invitation);
                },
            });
        });
    };
}


// InvitationNotificationService: InvitationUpdated
// noinspection JSUnusedGlobalSymbols
export function onInvitationUpdated(options?: {count?: bigint, filter?: datatypes.InvitationFilter, invitationIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, invitation: datatypes.Invitation,previous_invitation_status: datatypes.Invitation_Status) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, invitation: datatypes.Invitation,previous_invitation_status: datatypes.Invitation_Status) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onInvitationUpdated({
                ...options,
                callback: async (invitation: datatypes.Invitation,previous_invitation_status: datatypes.Invitation_Status) => {
                    await target.call(this, invitation,previous_invitation_status);
                },
            });
        });
    };
}


// ContactNotificationService: ContactNew
// noinspection JSUnusedGlobalSymbols
export function onContactNew(options?: {count?: bigint, filter?: datatypes.ContactFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, contact: datatypes.Contact) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, contact: datatypes.Contact) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onContactNew({
                ...options,
                callback: async (contact: datatypes.Contact) => {
                    await target.call(this, contact);
                },
            });
        });
    };
}


// ContactNotificationService: ContactDeleted
// noinspection JSUnusedGlobalSymbols
export function onContactDeleted(options?: {count?: bigint, filter?: datatypes.ContactFilter, contactIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, contact: datatypes.Contact) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, contact: datatypes.Contact) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onContactDeleted({
                ...options,
                callback: async (contact: datatypes.Contact) => {
                    await target.call(this, contact);
                },
            });
        });
    };
}


// ContactNotificationService: ContactDetailsUpdated
// noinspection JSUnusedGlobalSymbols
export function onContactDetailsUpdated(options?: {count?: bigint, filter?: datatypes.ContactFilter, contactIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, contact: datatypes.Contact,previous_details: datatypes.IdentityDetails) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, contact: datatypes.Contact,previous_details: datatypes.IdentityDetails) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onContactDetailsUpdated({
                ...options,
                callback: async (contact: datatypes.Contact,previous_details: datatypes.IdentityDetails) => {
                    await target.call(this, contact,previous_details);
                },
            });
        });
    };
}


// ContactNotificationService: ContactPhotoUpdated
// noinspection JSUnusedGlobalSymbols
export function onContactPhotoUpdated(options?: {count?: bigint, filter?: datatypes.ContactFilter, contactIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, contact: datatypes.Contact) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, contact: datatypes.Contact) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onContactPhotoUpdated({
                ...options,
                callback: async (contact: datatypes.Contact) => {
                    await target.call(this, contact);
                },
            });
        });
    };
}


// GroupNotificationService: GroupNew
// noinspection JSUnusedGlobalSymbols
export function onGroupNew(options?: {count?: bigint, groupFilter?: datatypes.GroupFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupNew({
                ...options,
                callback: async (group: datatypes.Group) => {
                    await target.call(this, group);
                },
            });
        });
    };
}


// GroupNotificationService: GroupDeleted
// noinspection JSUnusedGlobalSymbols
export function onGroupDeleted(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupDeleted({
                ...options,
                callback: async (group: datatypes.Group) => {
                    await target.call(this, group);
                },
            });
        });
    };
}


// GroupNotificationService: GroupNameUpdated
// noinspection JSUnusedGlobalSymbols
export function onGroupNameUpdated(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, previousNameSearch?: string}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,previous_name: string) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,previous_name: string) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupNameUpdated({
                ...options,
                callback: async (group: datatypes.Group,previous_name: string) => {
                    await target.call(this, group,previous_name);
                },
            });
        });
    };
}


// GroupNotificationService: GroupPhotoUpdated
// noinspection JSUnusedGlobalSymbols
export function onGroupPhotoUpdated(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupPhotoUpdated({
                ...options,
                callback: async (group: datatypes.Group) => {
                    await target.call(this, group);
                },
            });
        });
    };
}


// GroupNotificationService: GroupDescriptionUpdated
// noinspection JSUnusedGlobalSymbols
export function onGroupDescriptionUpdated(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, previousDescriptionSearch?: string}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,previous_description: string) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,previous_description: string) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupDescriptionUpdated({
                ...options,
                callback: async (group: datatypes.Group,previous_description: string) => {
                    await target.call(this, group,previous_description);
                },
            });
        });
    };
}


// GroupNotificationService: GroupPendingMemberAdded
// noinspection JSUnusedGlobalSymbols
export function onGroupPendingMemberAdded(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, pendingMemberFilter?: datatypes.PendingGroupMemberFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,pending_member: datatypes.PendingGroupMember) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,pending_member: datatypes.PendingGroupMember) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupPendingMemberAdded({
                ...options,
                callback: async (group: datatypes.Group,pending_member: datatypes.PendingGroupMember) => {
                    await target.call(this, group,pending_member);
                },
            });
        });
    };
}


// GroupNotificationService: GroupPendingMemberRemoved
// noinspection JSUnusedGlobalSymbols
export function onGroupPendingMemberRemoved(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, pendingMemberFilter?: datatypes.PendingGroupMemberFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,pending_member: datatypes.PendingGroupMember) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,pending_member: datatypes.PendingGroupMember) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupPendingMemberRemoved({
                ...options,
                callback: async (group: datatypes.Group,pending_member: datatypes.PendingGroupMember) => {
                    await target.call(this, group,pending_member);
                },
            });
        });
    };
}


// GroupNotificationService: GroupMemberJoined
// noinspection JSUnusedGlobalSymbols
export function onGroupMemberJoined(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, memberFilter?: datatypes.GroupMemberFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,member: datatypes.GroupMember) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,member: datatypes.GroupMember) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupMemberJoined({
                ...options,
                callback: async (group: datatypes.Group,member: datatypes.GroupMember) => {
                    await target.call(this, group,member);
                },
            });
        });
    };
}


// GroupNotificationService: GroupMemberLeft
// noinspection JSUnusedGlobalSymbols
export function onGroupMemberLeft(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, memberFilter?: datatypes.GroupMemberFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,member: datatypes.GroupMember) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,member: datatypes.GroupMember) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupMemberLeft({
                ...options,
                callback: async (group: datatypes.Group,member: datatypes.GroupMember) => {
                    await target.call(this, group,member);
                },
            });
        });
    };
}


// GroupNotificationService: GroupOwnPermissionsUpdated
// noinspection JSUnusedGlobalSymbols
export function onGroupOwnPermissionsUpdated(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, permissionsFilter?: datatypes.GroupPermissionFilter, previousPermissionsFilter?: datatypes.GroupPermissionFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,permissions: datatypes.GroupMemberPermissions,previous_permissions: datatypes.GroupMemberPermissions) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,permissions: datatypes.GroupMemberPermissions,previous_permissions: datatypes.GroupMemberPermissions) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupOwnPermissionsUpdated({
                ...options,
                callback: async (group: datatypes.Group,permissions: datatypes.GroupMemberPermissions,previous_permissions: datatypes.GroupMemberPermissions) => {
                    await target.call(this, group,permissions,previous_permissions);
                },
            });
        });
    };
}


// GroupNotificationService: GroupMemberPermissionsUpdated
// noinspection JSUnusedGlobalSymbols
export function onGroupMemberPermissionsUpdated(options?: {count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, memberFilter?: datatypes.GroupMemberFilter, previousPermissionFilter?: datatypes.GroupMemberFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, group: datatypes.Group,member: datatypes.GroupMember,previous_permissions: datatypes.GroupMemberPermissions) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, group: datatypes.Group,member: datatypes.GroupMember,previous_permissions: datatypes.GroupMemberPermissions) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onGroupMemberPermissionsUpdated({
                ...options,
                callback: async (group: datatypes.Group,member: datatypes.GroupMember,previous_permissions: datatypes.GroupMemberPermissions) => {
                    await target.call(this, group,member,previous_permissions);
                },
            });
        });
    };
}


// DiscussionNotificationService: DiscussionNew
// noinspection JSUnusedGlobalSymbols
export function onDiscussionNew(options?: {count?: bigint, filter?: datatypes.DiscussionFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, discussion: datatypes.Discussion) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, discussion: datatypes.Discussion) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onDiscussionNew({
                ...options,
                callback: async (discussion: datatypes.Discussion) => {
                    await target.call(this, discussion);
                },
            });
        });
    };
}


// DiscussionNotificationService: DiscussionLocked
// noinspection JSUnusedGlobalSymbols
export function onDiscussionLocked(options?: {count?: bigint, filter?: datatypes.DiscussionFilter, discussionIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, discussion: datatypes.Discussion) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, discussion: datatypes.Discussion) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onDiscussionLocked({
                ...options,
                callback: async (discussion: datatypes.Discussion) => {
                    await target.call(this, discussion);
                },
            });
        });
    };
}


// DiscussionNotificationService: DiscussionTitleUpdated
// noinspection JSUnusedGlobalSymbols
export function onDiscussionTitleUpdated(options?: {count?: bigint, filter?: datatypes.DiscussionFilter, discussionIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, discussion: datatypes.Discussion,previous_title: string) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, discussion: datatypes.Discussion,previous_title: string) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onDiscussionTitleUpdated({
                ...options,
                callback: async (discussion: datatypes.Discussion,previous_title: string) => {
                    await target.call(this, discussion,previous_title);
                },
            });
        });
    };
}


// DiscussionNotificationService: DiscussionSettingsUpdated
// noinspection JSUnusedGlobalSymbols
export function onDiscussionSettingsUpdated(options?: {count?: bigint, filter?: datatypes.DiscussionFilter, discussionIds?: bigint[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, discussion: datatypes.Discussion,new_settings: datatypes.DiscussionSettings,previous_settings: datatypes.DiscussionSettings) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, discussion: datatypes.Discussion,new_settings: datatypes.DiscussionSettings,previous_settings: datatypes.DiscussionSettings) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onDiscussionSettingsUpdated({
                ...options,
                callback: async (discussion: datatypes.Discussion,new_settings: datatypes.DiscussionSettings,previous_settings: datatypes.DiscussionSettings) => {
                    await target.call(this, discussion,new_settings,previous_settings);
                },
            });
        });
    };
}


// MessageNotificationService: MessageReceived
// noinspection JSUnusedGlobalSymbols
export function onMessageReceived(options?: {count?: bigint, filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageReceived({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageSent
// noinspection JSUnusedGlobalSymbols
export function onMessageSent(options?: {count?: bigint, filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageSent({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageDeleted
// noinspection JSUnusedGlobalSymbols
export function onMessageDeleted(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageDeleted({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageBodyUpdated
// noinspection JSUnusedGlobalSymbols
export function onMessageBodyUpdated(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message,previous_body: string) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message,previous_body: string) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageBodyUpdated({
                ...options,
                callback: async (message: datatypes.Message,previous_body: string) => {
                    await target.call(this, message,previous_body);
                },
            });
        });
    };
}


// MessageNotificationService: MessageUploaded
// noinspection JSUnusedGlobalSymbols
export function onMessageUploaded(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageUploaded({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageDelivered
// noinspection JSUnusedGlobalSymbols
export function onMessageDelivered(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageDelivered({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageRead
// noinspection JSUnusedGlobalSymbols
export function onMessageRead(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageRead({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageLocationReceived
// noinspection JSUnusedGlobalSymbols
export function onMessageLocationReceived(options?: {count?: bigint, filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageLocationReceived({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageLocationSent
// noinspection JSUnusedGlobalSymbols
export function onMessageLocationSent(options?: {count?: bigint, filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageLocationSent({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageLocationSharingStart
// noinspection JSUnusedGlobalSymbols
export function onMessageLocationSharingStart(options?: {count?: bigint, filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageLocationSharingStart({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageLocationSharingUpdate
// noinspection JSUnusedGlobalSymbols
export function onMessageLocationSharingUpdate(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message,previous_location: datatypes.MessageLocation) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message,previous_location: datatypes.MessageLocation) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageLocationSharingUpdate({
                ...options,
                callback: async (message: datatypes.Message,previous_location: datatypes.MessageLocation) => {
                    await target.call(this, message,previous_location);
                },
            });
        });
    };
}


// MessageNotificationService: MessageLocationSharingEnd
// noinspection JSUnusedGlobalSymbols
export function onMessageLocationSharingEnd(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageLocationSharingEnd({
                ...options,
                callback: async (message: datatypes.Message) => {
                    await target.call(this, message);
                },
            });
        });
    };
}


// MessageNotificationService: MessageReactionAdded
// noinspection JSUnusedGlobalSymbols
export function onMessageReactionAdded(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter, reactionFilter?: datatypes.ReactionFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message,reaction: datatypes.MessageReaction) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message,reaction: datatypes.MessageReaction) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageReactionAdded({
                ...options,
                callback: async (message: datatypes.Message,reaction: datatypes.MessageReaction) => {
                    await target.call(this, message,reaction);
                },
            });
        });
    };
}


// MessageNotificationService: MessageReactionUpdated
// noinspection JSUnusedGlobalSymbols
export function onMessageReactionUpdated(options?: {count?: bigint, messageIds?: datatypes.MessageId[], messageFilter?: datatypes.MessageFilter, reactionFilter?: datatypes.ReactionFilter, previousReactionFilter?: datatypes.ReactionFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message,reaction: datatypes.MessageReaction,previous_reaction: datatypes.MessageReaction) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message,reaction: datatypes.MessageReaction,previous_reaction: datatypes.MessageReaction) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageReactionUpdated({
                ...options,
                callback: async (message: datatypes.Message,reaction: datatypes.MessageReaction,previous_reaction: datatypes.MessageReaction) => {
                    await target.call(this, message,reaction,previous_reaction);
                },
            });
        });
    };
}


// MessageNotificationService: MessageReactionRemoved
// noinspection JSUnusedGlobalSymbols
export function onMessageReactionRemoved(options?: {count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter, reactionFilter?: datatypes.ReactionFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, message: datatypes.Message,reaction: datatypes.MessageReaction) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, message: datatypes.Message,reaction: datatypes.MessageReaction) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onMessageReactionRemoved({
                ...options,
                callback: async (message: datatypes.Message,reaction: datatypes.MessageReaction) => {
                    await target.call(this, message,reaction);
                },
            });
        });
    };
}


// AttachmentNotificationService: AttachmentReceived
// noinspection JSUnusedGlobalSymbols
export function onAttachmentReceived(options?: {count?: bigint, filter?: datatypes.AttachmentFilter}) {
    return function <This extends OlvidClient>(
        target: (this: This, attachment: datatypes.Attachment) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, attachment: datatypes.Attachment) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onAttachmentReceived({
                ...options,
                callback: async (attachment: datatypes.Attachment) => {
                    await target.call(this, attachment);
                },
            });
        });
    };
}


// AttachmentNotificationService: AttachmentUploaded
// noinspection JSUnusedGlobalSymbols
export function onAttachmentUploaded(options?: {count?: bigint, filter?: datatypes.AttachmentFilter, messageIds?: datatypes.MessageId[], attachmentIds?: datatypes.AttachmentId[]}) {
    return function <This extends OlvidClient>(
        target: (this: This, attachment: datatypes.Attachment) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, attachment: datatypes.Attachment) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onAttachmentUploaded({
                ...options,
                callback: async (attachment: datatypes.Attachment) => {
                    await target.call(this, attachment);
                },
            });
        });
    };
}


// CallNotificationService: CallIncomingCall
// noinspection JSUnusedGlobalSymbols
export function onCallIncomingCall(options?: {count?: bigint}) {
    return function <This extends OlvidClient>(
        target: (this: This, call_identifier: string,discussion_id: bigint,participant_id: datatypes.CallParticipantId,caller_display_name: string,participant_count: number) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, call_identifier: string,discussion_id: bigint,participant_id: datatypes.CallParticipantId,caller_display_name: string,participant_count: number) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onCallIncomingCall({
                ...options,
                callback: async (call_identifier: string,discussion_id: bigint,participant_id: datatypes.CallParticipantId,caller_display_name: string,participant_count: number) => {
                    await target.call(this, call_identifier,discussion_id,participant_id,caller_display_name,participant_count);
                },
            });
        });
    };
}


// CallNotificationService: CallRinging
// noinspection JSUnusedGlobalSymbols
export function onCallRinging(options?: {count?: bigint}) {
    return function <This extends OlvidClient>(
        target: (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onCallRinging({
                ...options,
                callback: async (call_identifier: string,participant_id: datatypes.CallParticipantId) => {
                    await target.call(this, call_identifier,participant_id);
                },
            });
        });
    };
}


// CallNotificationService: CallAccepted
// noinspection JSUnusedGlobalSymbols
export function onCallAccepted(options?: {count?: bigint}) {
    return function <This extends OlvidClient>(
        target: (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onCallAccepted({
                ...options,
                callback: async (call_identifier: string,participant_id: datatypes.CallParticipantId) => {
                    await target.call(this, call_identifier,participant_id);
                },
            });
        });
    };
}


// CallNotificationService: CallDeclined
// noinspection JSUnusedGlobalSymbols
export function onCallDeclined(options?: {count?: bigint}) {
    return function <This extends OlvidClient>(
        target: (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onCallDeclined({
                ...options,
                callback: async (call_identifier: string,participant_id: datatypes.CallParticipantId) => {
                    await target.call(this, call_identifier,participant_id);
                },
            });
        });
    };
}


// CallNotificationService: CallBusy
// noinspection JSUnusedGlobalSymbols
export function onCallBusy(options?: {count?: bigint}) {
    return function <This extends OlvidClient>(
        target: (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, call_identifier: string,participant_id: datatypes.CallParticipantId) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onCallBusy({
                ...options,
                callback: async (call_identifier: string,participant_id: datatypes.CallParticipantId) => {
                    await target.call(this, call_identifier,participant_id);
                },
            });
        });
    };
}


// CallNotificationService: CallEnded
// noinspection JSUnusedGlobalSymbols
export function onCallEnded(options?: {count?: bigint}) {
    return function <This extends OlvidClient>(
        target: (this: This, call_identifier: string) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, call_identifier: string) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.onCallEnded({
                ...options,
                callback: async (call_identifier: string) => {
                    await target.call(this, call_identifier);
                },
            });
        });
    };
}

