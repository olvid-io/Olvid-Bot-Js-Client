import OlvidClient from "../OlvidClient";

import {Attachment, AttachmentId_Type} from "../gen/olvid/daemon/datatypes/v1/datatypes";

export default abstract class AttachmentHelper {
    /**
     * Checks if this is an inbound attachment
     * @param attachment concerned attachment
     * @returns True if the attachment is inbound, false if outbound
     */
    public static isInbound(attachment: Attachment): boolean {
        return attachment.id?.type === AttachmentId_Type.INBOUND;
    }

    /**
     * Checks if this is an outbound attachment
     * @param attachment concerned attachment
     * @returns True if the attachment is outbound, false if inbound
     */
    public static isOutbound(attachment: Attachment): boolean {
        return attachment.id?.type === AttachmentId_Type.OUTBOUND;
    }

    /**
     * Deletes this attachment
     * @param client - The Olvid client instance
     * @param attachment concerned attachment
     * @param deleteEverywhere - Whether to delete the message for all participants (default: false)
     * @returns Promise that resolves when the attachment is deleted
     */
    public static async delete(client: OlvidClient, attachment: Attachment, deleteEverywhere: boolean = false): Promise<void> {
        await client.attachmentDelete({ attachmentId: attachment.id!, deleteEverywhere });
    }

    /**
     * Waits for this attachment to be uploaded on server
     * @param client - The Olvid client instance
     * @param attachment concerned attachment
     * @returns Promise that resolves whe attachment have been uploaded on server
     */
    public static async waitForUpload(client: OlvidClient, attachment: Attachment): Promise<void> {
        new Promise((resolve) => {
            client.onAttachmentUploaded({
                callback: resolve,
                attachmentIds: [attachment.id!],
                count: BigInt(1)
            });
        });
    }
}