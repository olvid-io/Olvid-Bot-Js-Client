import OlvidClient from "../OlvidClient";
import path from "path";
import fs from "fs";

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
     * Downloads and saves the attachment to the specified directory
     * @param client - The Olvid client instance
     * @param attachment concerned attachment
     * @param saveDir - The directory where the attachment should be saved
     * @param filename - Optional custom filename. If not provided, uses the attachment's original filename
     * @returns Promise that resolves to the full file path where the attachment was saved
     * @throws Error if there's an issue during the download or save process
     */
    public static async save(client: OlvidClient, attachment: Attachment, saveDir: string, filename?: string): Promise<string> {
        if (!filename) {
            filename = attachment.fileName;
        }
        const filepath = path.join(saveDir, filename);

        try {
            if (!fs.existsSync(saveDir)) {
                await fs.promises.mkdir(saveDir, {recursive: true});
            }
            let fileStream = fs.createWriteStream(filepath);
            for await (let chunk of client.attachmentDownload({attachmentId: attachment.id!})) {
                if (!fileStream.write(chunk)) {
                    await new Promise((resolve) => fileStream.once("drain", () => {resolve(undefined)}));
                }
            }
            fileStream.close();
        } catch (err) {
            console.error("Error saving attachment:", err); // handle error while writing the file
        }
        return filepath;
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