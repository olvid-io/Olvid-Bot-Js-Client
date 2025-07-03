// // TODO welcome bot or chat bot
//
// import {OlvidClient, datatypes} from "../olvid";
//
// export default class ChatBot extends OlvidClient {
//     private welcomeMessageFactory: ((discussion: datatypes.Discussion) => string | Promise<string>) | null = null;
//     private helpMessageFactory: ((discussionId: bigint) => string | Promise<string>) | null = null;
//
//     // welcome message
//     private _welcomeMessage: string | null = null;
//     private _welcomeSendHelp: boolean = true;
//     private _welcomeSendInOneToOne: boolean = true;
//     private _welcomeSendInGroups: boolean = true;
//     private _welcomeCancelListener: Function;
//
//     // help message
//     private _helpMessage: string | null = null;
//     private _helpAlwaysSendInToOne: boolean = true;
//     private _helpAlwaysSendInGroup: boolean = false;
//     private _helpCommandPrefix: string | null = null;
//     private _helpCancelListener: Function|null;
//
//     constructor() {
//         super();
//         this._helpCancelListener = this.onMessageReceived({callback: this._messageReceivedHandler.bind(this)})
//         this._welcomeCancelListener = this.onDiscussionNew({callback: this._discussionNewHandler.bind(this)})
//     }
//
//     // Help configuration
//     public helpSetMessage(helpMessage: string): ChatBot {
//         this._helpMessage = helpMessage;
//         this.helpMessageFactory = null;
//         return this;
//     }
//
//     public helpSetMessageFactory(factory: (discussionId: bigint) => string | Promise<string>): ChatBot {
//         this._helpMessage = null;
//         this.helpMessageFactory = factory;
//         return this;
//     }
//
//     public helpDisableCommand(): ChatBot {
//         if (this._helpCancelListener) {
//             this._helpCancelListener()
//             this._helpCancelListener = null;
//         }
//         return this;
//     }
//
//     public helpSendOnInvalidCommand(commandPrefix: string = "!"): ChatBot {
//         this._helpCommandPrefix = commandPrefix;
//         return this;
//     }
//
//     public helpAlwaysSendInGroups(): ChatBot {
//         this._helpAlwaysSendInGroup = true;
//         return this;
//     }
//
//     public helpDoNotAlwaysSendInOneToOne(): ChatBot {
//         this._helpAlwaysSendInToOne = false;
//         return this;
//     }
//
//     // TODO implements with checkers
//     // public helpAddCustomChecker(checker: (message: datatypes.Message) => boolean): ChatBot {
//     //     return this;
//     // }
//
//     private async _messageReceivedHandler(message: datatypes.Message) {
//         // if message is a valid command do nothing
//         if (this.toolIsMessageAValidCommand(message)) {
//             return;
//         }
//
//         // check if we send help on invalid command, and if this was supposed to be a command
//         if (this._helpCommandPrefix && message.body.startsWith(this._helpCommandPrefix)) {
//             await this.sendHelpMessage(message.discussionId);
//         }
//
//         const discussion: datatypes.Discussion = await this.discussionGet({ discussionId: message.discussionId });
//         if (discussion.identifier.case == "contactId" && this._helpAlwaysSendInToOne) {
//             await this.sendHelpMessage(message.discussionId);
//         } else if (discussion.identifier.case == "groupId" && this._helpAlwaysSendInGroup) {
//             await this.sendHelpMessage(message.discussionId);
//         }
//     }
//
//     // Welcome configuration
//     public welcomeSetMessage(welcomeMessage: string): ChatBot {
//         this._welcomeMessage = welcomeMessage;
//         this.welcomeMessageFactory = null;
//         return this;
//     }
//
//     public welcomeSetMessageFactory(factory: (discussion: datatypes.Discussion) => string | Promise<string>): ChatBot {
//         this._welcomeMessage = null;
//         this.welcomeMessageFactory = factory;
//         return this;
//     }
//
//     public welcomeDoNotSendInOneToOne(): ChatBot {
//         this._welcomeSendInOneToOne = false;
//         return this;
//     }
//
//     public welcomeDoNotSendInGroups(): ChatBot {
//         this._welcomeSendInGroups = false;
//         return this;
//     }
//
//     public welcomeDoNotSendHelp(): ChatBot {
//         this._welcomeSendHelp = false;
//         return this;
//     }
//
//     // Help section
//     async sendHelpMessage(discussionId: bigint): Promise<void> {
//         if (this._helpMessage) {
//             await this.messageSend({ discussionId, body: this._helpMessage });
//         } else if (this.helpMessageFactory) {
//             const promise = this.helpMessageFactory(discussionId);
//             let helpMessage: string;
//             if (promise instanceof Promise) {
//                 helpMessage = await promise;
//             } else {
//                 helpMessage = promise as string;
//             }
//             if (helpMessage) {
//                 await this.messageSend({ discussionId, body: helpMessage });
//             }
//         }
//     }
//
//     async _helpCommandHandler(message: datatypes.Message): Promise<void> {
//         await this.sendHelpMessage(message.discussionId);
//     }
//
//     // Welcome section
//     async sendWelcomeMessage(discussion: datatypes.Discussion): Promise<void> {
//         if (this._welcomeMessage) {
//             await this.messageSend({discussionId: discussion.id, body: this._welcomeMessage});
//         } else if (this.welcomeMessageFactory) {
//             const promise = this.welcomeMessageFactory(discussion);
//             let welcomeMessage: string;
//             if (promise instanceof Promise) {
//                 welcomeMessage = await promise;
//             } else {
//                 welcomeMessage = promise as string;
//             }
//             if (welcomeMessage) {
//                 await this.messageSend({discussionId: discussion.id, body: welcomeMessage});
//             }
//             if (this._welcomeSendHelp) {
//                 await this.sendHelpMessage(discussion.id);
//             }
//         }
//     }
//
//     // On discussion creation, create a webhook and post it in discussion
//     async _discussionNewHandler(discussion: datatypes.Discussion): Promise<void> {
//         // handle new groups (we do not need to wait to post in a group)
//         if (discussion.identifier.case === "groupId") {
//             await this.sendWelcomeMessage(discussion);
//             return;
//         }
//
//         // handle the new contact case
//         if (discussion.identifier.case === "contactId") {
//             return;
//         }
//
//         // check if contact have channels to post a message
//         if (discussion.identifier.case === "contactId") {
//             const contact = await this.contactGet({ contactId: discussion.identifier.value });
//             if (contact.establishedChannelCount !== 0) {
//                 await this.sendWelcomeMessage(discussion);
//                 return;
//             }
//
//             // if contact has no channel a background task that will try to post the welcome message later
//             this._postWelcomeMessageTask(discussion, discussion.identifier.value).then();
//         }
//     }
//
//     // if there are no channel create a task that will wait for up to 10 seconds to post the message
//     async _postWelcomeMessageTask(discussion: datatypes.Discussion, contact_id: bigint): Promise<void> {
//         let count = 0;
//         const maxCount = 1000;
//         while (count < maxCount) {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             const c = await this.contactGet({ contactId: contact_id });
//             if (c.establishedChannelCount > 0) {
//                 await this.sendWelcomeMessage(discussion);
//                 return;
//             }
//             count++;
//         }
//     }
//
//     // tools
//     async toolBasicWelcomeFactory(discussion: datatypes.Discussion): Promise<string> {
//         let name: string = "";
//         if (discussion.identifier.case === "contactId") {
//             const contact: datatypes.Contact = await this.contactGet({ contactId: discussion.identifier.value });
//             name = contact.details?.firstName || contact.displayName;
//         } else if (discussion.identifier.case === "groupId") {
//             const group: datatypes.Group = await this.groupGet({ groupId: discussion.identifier.value });
//             if (group.members.length === 1) {
//                 const contact: datatypes.Contact = await this.contactGet({ contactId: group.members[0].contactId });
//                 name = contact.details?.firstName || contact.displayName;
//             } else {
//                 name = "everyone";
//             }
//         }
//         const greetings: string[] = ["Hi", "Hello", "Hey"];
//         return `
// ${greetings[Math.floor(Math.random() * greetings.length)]} ${name} 👋
// `.trim();
//     }
//
//     static async toolIgnoreLocationMessageChecker(message: datatypes.Message): Promise<boolean> {
//         return message.messageLocation?.type === datatypes.MessageLocation_LocationType.UNSPECIFIED;
//     }
//
//     toolIsMessageAValidCommand(message: datatypes.Message): boolean {
//         return this._listenersSet.some(listener => listener instanceof Command && listener.match(message));
//     }
// }