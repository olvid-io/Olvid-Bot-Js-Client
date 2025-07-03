import {datatypes, OlvidClient} from "../olvid";
import {MessageId_Type} from "../gen/olvid/daemon/datatypes/v1/message_pb";

type MessageFilterFunction = { (message: datatypes.Message): boolean };

export default class SelfCleaningBot extends OlvidClient {
    // keep original messages (sent by message_sent notification)
    // then we decrement attachment_number field every time an attachment had been uploaded
    // when every attachment had been sent we delete message and attachment
    private pendingOutboundMessagesById: Map<bigint, datatypes.Message> = new Map();

    private readonly cleanInboundMessages: boolean = false;
    private readonly cleanOutboundMessages: boolean = false;
    private readonly isMessageForCleaning: MessageFilterFunction|undefined = undefined;

    constructor(options: {policy: {cleanInboundMessages?: boolean, cleanOutboundMessages?: boolean, isMessageForCleaning?: MessageFilterFunction}, serverUrl?: string, clientKey?: string}) {
        super(options);

        if (options.policy.isMessageForCleaning)
            this.isMessageForCleaning = options.policy.isMessageForCleaning ?? undefined;
        if (options.policy.cleanInboundMessages)
            this.cleanInboundMessages = options.policy.cleanInboundMessages ?? false;
        if (options.policy.cleanOutboundMessages)
            this.cleanOutboundMessages = options.policy.cleanOutboundMessages ?? false;

        this.onMessageReceived({callback: (m) => this.messageReceivedHandler(m)});
        this.onMessageSent({callback: (m) => this.messageSentHandler(m)});
        this.onMessageUploaded({callback: (m) => this.messageUploadedHandler(m)});
        this.onAttachmentUploaded({callback: (a) => this.attachmentUploadedHandler(a)});

        SelfCleaningBot.cleanOnStartTask(this, this.cleanInboundMessages, this.cleanOutboundMessages, this.isMessageForCleaning).then();
    }

    // this is static to be usable even if we do not instantiate a full SelfCleaningBot
    public static async cleanOnStartTask(client: OlvidClient, cleanInboundMessage: boolean, cleanOutboundMessage: boolean, isMessageForCleaning?: MessageFilterFunction) {
        // delete messages
        for await (let message of client.messageList()) {
            try {
                if (cleanInboundMessage && message.id?.type == MessageId_Type.INBOUND) {
                    await client.messageDelete({messageId: message.id!});
                }
                else if (cleanOutboundMessage && message.id?.type == MessageId_Type.OUTBOUND) {
                    await client.messageDelete({messageId: message.id!});
                }
                else if (isMessageForCleaning && isMessageForCleaning(message)) {
                    await client.messageDelete({messageId: message.id!});
                }
            }
            catch (error) {
                console.error("SelfCleaningBot: cleanOnStartTask: ignored error", error);
            }
        }
    }

    // delete inbound messages
    private async messageReceivedHandler(message: datatypes.Message) {
        if (this.cleanInboundMessages || (this.isMessageForCleaning && this.isMessageForCleaning(message))) {
            await this.messageDelete({messageId: message.id!});
        }
    }

    // mark outbound messages as pending and wait for message and attachments upload
    private async messageSentHandler(message: datatypes.Message) {
        if (this.cleanOutboundMessages || (this.isMessageForCleaning && this.isMessageForCleaning(message))) {
            this.pendingOutboundMessagesById.set(message.id?.id!, message);
        }
    }

    private async messageUploadedHandler(message: datatypes.Message) {
        const pendingMessage = this.pendingOutboundMessagesById.get(message.id?.id!);
        if (pendingMessage) {
            // wait for attachments upload
            if (pendingMessage.attachmentsCount > 0) {
                return ;
            }
            // we can delete message now
            else {
                await this.messageDelete({messageId: message.id!});
                this.pendingOutboundMessagesById.delete(message.id?.id!);
            }
        }
    }

    private async attachmentUploadedHandler(attachment: datatypes.Attachment) {
        const pendingMessage = this.pendingOutboundMessagesById.get(attachment.messageId?.id!);
        if (pendingMessage) {
            pendingMessage.attachmentsCount--;

            // All attachments have been uploaded, we can delete the message.
            if (pendingMessage.attachmentsCount <= 0) {
                await this.messageDelete({messageId: attachment.messageId!});
                this.pendingOutboundMessagesById.delete(pendingMessage.id?.id!)
            }
        }
    }

    /*
    ** tool
    */
    // manually mark an outbound message for deletion
    // this message will be deleted after it was uploaded with all its attachments
    public markOutboundMessageForDeletion(message: datatypes.Message) {
        this.pendingOutboundMessagesById.set(message.id?.id!, message);
    }
}
