import OlvidClient from ".././../../../../OlvidClient";
import { Attachment, AttachmentId, AttachmentId_Type } from "../../../../../gen/olvid/daemon/datatypes/v1/attachment_pb";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedAttachment extends Attachment {
    /**
     * Checks if this is an inbound attachment
     * @returns True if the attachment is inbound, false if outbound
     */
    public isInbound(): boolean {
        return this.id?.type === AttachmentId_Type.INBOUND;
    }

    /**
     * Checks if this is an outbound attachment
     * @returns True if the attachment is outbound, false if inbound
     */
    public isOutbound(): boolean {
        return this.id?.type === AttachmentId_Type.OUTBOUND;
    }

    /**
     * Deletes this attachment
     * @param client - The Olvid client instance
     * @param deleteEverywhere - Whether to delete the message for all participants (default: false)
     * @returns Promise that resolves when the attachment is deleted
     */
    public async delete(client: OlvidClient, deleteEverywhere: boolean = false): Promise<void> {
        await client.attachmentDelete({ attachmentId: this.id!, deleteEverywhere });
    }

    /**
     * Waits for this attachment to be uploaded on server
     * @param client - The Olvid client instance
     * @returns Promise that resolves whe attachment have been uploaded on server
     */
    public async waitForUpload(client: OlvidClient): Promise<void> {
        new Promise((resolve) => {
            client.onAttachmentUploaded({
                callback: resolve,
                attachmentIds: [this.id!],
                count: BigInt(1)
            });
        });
    }
}

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedAttachmentId extends AttachmentId {
    /**
     * Returns a string representation of the attachment ID
     * @returns A string in the format "I{id}" for inbound attachments or "O{id}" for outbound attachments
     */
    public toString(): string {
        return `${this.type === AttachmentId_Type.INBOUND ? 'I' : 'O'}${this.id}`;
    }
}
