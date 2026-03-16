import {AbstractOlvidClient} from "./gen/AbstractOlvidClient.js";
import { createGrpcTransport, type GrpcTransportOptions } from "@connectrpc/connect-node";

import * as datatypes from "./gen/olvid/daemon/datatypes/v1/datatypes";
import * as commands from "./gen/olvid/daemon/command/v1/command";
import * as fs from 'fs';
import path from "node:path";
import {create, equals} from "@bufbuild/protobuf";

const ATTACHMENT_CHUNK_SIZE = 1024 * 1024; // 1MB

// noinspection HttpUrlsUsage
export default class OlvidClient extends AbstractOlvidClient {
	public readonly daemonUrl: string;

	constructor(options: {daemonUrl?: string, clientKey?: string} = {}) {
		// load config from env if .env file exists
		try {
			process.loadEnvFile()
		} catch (ignore) {}

		let daemonUrl: string = options.daemonUrl ?? process.env.OLVID_DAEMON_URL ?? "http://localhost:50051";
		// add http or https prefix in daemonUrl if necessary
		if (!daemonUrl.startsWith("http://") && !daemonUrl.startsWith("https://")) {
			daemonUrl = `http://${daemonUrl}`;
		}
		let clientKey: string|undefined = options.clientKey ?? process.env.OLVID_CLIENT_KEY;

		let transportOptions: GrpcTransportOptions = {
			baseUrl: daemonUrl,
			useBinaryFormat: true,
		}
		super(createGrpcTransport, transportOptions, clientKey);
		this.daemonUrl = daemonUrl;
	}

    /*
    ** Manually implemented tools methods
    */
    // noinspection JSUnusedGlobalSymbols
    public async enableAutoInvitation(options: { acceptAll?: boolean, autoAcceptIntroduction?: boolean, autoAcceptGroup?: boolean,autoAcceptOneToOne?: boolean, autoAcceptInvitation?: boolean}) {
        let invitation: datatypes.IdentitySettings_AutoAcceptInvitation;
        if (options.acceptAll) {
            invitation = create(datatypes.IdentitySettings_AutoAcceptInvitationSchema, {
                autoAcceptIntroduction: true,
                autoAcceptGroup: true,
                autoAcceptOneToOne: true,
                autoAcceptInvitation: true,
            })
        } else {
            invitation = create(datatypes.IdentitySettings_AutoAcceptInvitationSchema, options);
        }
        let identitySettings: datatypes.IdentitySettings = await this.settingsIdentityGet()
        if (!equals(datatypes.IdentitySettings_AutoAcceptInvitationSchema, identitySettings.invitation!, invitation)) {
            identitySettings.invitation = invitation;
            await this.settingsIdentitySet({identitySettings});
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public async enableKeycloakAutoInvite(options: { autoInviteNewMembers?: boolean}) {
        let keycloak: datatypes.IdentitySettings_Keycloak = create(datatypes.IdentitySettings_KeycloakSchema, options);
        let identitySettings: datatypes.IdentitySettings = await this.settingsIdentityGet()
        if (!equals(datatypes.IdentitySettings_KeycloakSchema, identitySettings.keycloak!, keycloak)) {
            identitySettings.keycloak = keycloak;
            await this.settingsIdentitySet({identitySettings});
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public async setMessageRetentionPolicy(options: {existenceDuration?: bigint, discussionCount?: bigint, globalCount?: bigint, cleanLockedDiscussions?: boolean, preserveIsSharingLocationMessages?: boolean}) {
        let messageRetention: datatypes.IdentitySettings_MessageRetention = create(datatypes.IdentitySettings_MessageRetentionSchema, options);
        let identitySettings: datatypes.IdentitySettings = await this.settingsIdentityGet()
        if (!equals(datatypes.IdentitySettings_MessageRetentionSchema, identitySettings.messageRetention!, messageRetention)) {
            identitySettings.messageRetention = messageRetention;
            await this.settingsIdentitySet({identitySettings});
        }
    }

    /*
    ** Manually implemented client side streaming methods
    */
	public async messageSendWithAttachments(request: { discussionId: bigint, attachments: {filename: string, payload: Uint8Array}[], body?: string, replyId?: datatypes.MessageId, ephemerality?: datatypes.MessageEphemerality, disableLinkPreview?: boolean}) {
		async function* requestStream(): AsyncIterable<commands.MessageSendWithAttachmentsRequest> {
			// send message and files metadata
			const metadata =  create(commands.MessageSendWithAttachmentsRequestMetadataSchema, {
				discussionId: request.discussionId,
				body: request.body,
				replyId: request.replyId,
				ephemerality: request.ephemerality,
				files: request.attachments.map((attachment) => {
					return create(commands.MessageSendWithAttachmentsRequestMetadata_FileSchema, {
						filename: attachment.filename,
						fileSize: BigInt(attachment.payload.byteLength)
					});
				}),
				disableLinkPreview: request.disableLinkPreview,
			});
			yield create(commands.MessageSendWithAttachmentsRequestSchema, {request: {case: "metadata", value: metadata}});

			// send files
			for (let attachment of request.attachments) {
				for (let chunk_index = 0; chunk_index < attachment.payload.byteLength; chunk_index += ATTACHMENT_CHUNK_SIZE) {
					// send chunk
					const chunk = new Uint8Array(attachment.payload.subarray(chunk_index, chunk_index + ATTACHMENT_CHUNK_SIZE));
					yield create(commands.MessageSendWithAttachmentsRequestSchema, {request: {case: "payload", value: chunk}});
				}
				// send file delimiter
				yield create(commands.MessageSendWithAttachmentsRequestSchema, {request: {case: "fileDelimiter", value: true},});
			}
		}
		const response = await this.stubs.messageCommandStub.messageSendWithAttachments(requestStream());
		return {message: response.message!, attachments: response.attachments!};
	}

	public async messageSendWithAttachmentsFiles(request: { discussionId: bigint, filesPath: string[], body?: string, replyId?: datatypes.MessageId, ephemerality?: datatypes.MessageEphemerality, disableLinkPreview?: boolean }) {
		async function* requestStream(): AsyncIterable<commands.MessageSendWithAttachmentsRequest> {
			// send message and files metadata
			const metadata =  create(commands.MessageSendWithAttachmentsRequestMetadataSchema, {
				discussionId: request.discussionId,
				body: request.body,
				replyId: request.replyId,
				ephemerality: request.ephemerality,
				disableLinkPreview: request.disableLinkPreview,
				files: request.filesPath.map((filePath: string) => {
					return create(commands.MessageSendWithAttachmentsRequestMetadata_FileSchema, {
						filename: path.basename(filePath),
						fileSize: BigInt(fs.statSync(filePath).size)
					});
				}),
			});
			yield create(commands.MessageSendWithAttachmentsRequestSchema, {request: {case: "metadata", value: metadata},});

			const buffer = Buffer.alloc(ATTACHMENT_CHUNK_SIZE);
			for (let filePath of request.filesPath) {
				let readCount = undefined;
				let readBytes = 0;
				let fd = fs.openSync(filePath, "r");

				while (readCount !== 0) {
					readCount = fs.readSync(fd, buffer, readBytes, ATTACHMENT_CHUNK_SIZE, null);
					if (readCount > 0) {
						yield create(commands.MessageSendWithAttachmentsRequestSchema, {request: {case: "payload", value: buffer.subarray(0, readCount)}});
					}
				}
				// send file delimiter
				yield create(commands.MessageSendWithAttachmentsRequestSchema, {request: {case: "fileDelimiter", value: true},});
			}
		}
		const response = await this.stubs.messageCommandStub.messageSendWithAttachments(requestStream());
		return {message: response.message!, attachments: response.attachments!};
	}

	// noinspection JSUnusedGlobalSymbols
	public async identitySetPhoto(request: {filePath: string}): Promise<void> {
		async function* requestStream(): AsyncIterable<commands.IdentitySetPhotoRequest> {
			// send metadata
			yield create(commands.IdentitySetPhotoRequestSchema, {request: {case: "metadata", value: create(commands.IdentitySetPhotoRequestMetadataSchema, {
						filename: path.basename(request.filePath),
						fileSize: BigInt(fs.statSync(request.filePath).size)
					})}});

			// send payload
			const buffer = Buffer.alloc(ATTACHMENT_CHUNK_SIZE);
			let readCount = undefined;
			let readBytes = 0;
			let fd = fs.openSync(request.filePath, "r");

			while (readCount !== 0) {
				readCount = fs.readSync(fd, buffer, readBytes, ATTACHMENT_CHUNK_SIZE, null);
				if (readCount > 0) {
					yield create(commands.IdentitySetPhotoRequestSchema, {request: {case: "payload", value: buffer.subarray(0, readCount)}});
				}
			}
		}
		await this.stubs.identityCommandStub.identitySetPhoto(requestStream());
	}

	// noinspection JSUnusedGlobalSymbols
	public async groupSetPhoto(request: {groupId: bigint, filePath: string}): Promise<void> {
		async function* requestStream(): AsyncIterable<commands.GroupSetPhotoRequest> {
			// send metadata
			yield create(commands.GroupSetPhotoRequestSchema, {request: {case: "metadata", value: create(commands.GroupSetPhotoRequestMetadataSchema, {
						groupId: request.groupId,
						filename: path.basename(request.filePath),
						fileSize: BigInt(fs.statSync(request.filePath).size)
					})}});

			// send payload
			const buffer = Buffer.alloc(ATTACHMENT_CHUNK_SIZE);
			let readCount = undefined;
			let readBytes = 0;
			let fd = fs.openSync(request.filePath, "r");

			while (readCount !== 0) {
				readCount = fs.readSync(fd, buffer, readBytes, ATTACHMENT_CHUNK_SIZE, null);
				if (readCount > 0) {
					yield create(commands.GroupSetPhotoRequestSchema, {request: {case: "payload", value: buffer.subarray(0, readCount)}});
				}
			}
		}
		await this.stubs.groupCommandStub.groupSetPhoto(requestStream());
	}
}
