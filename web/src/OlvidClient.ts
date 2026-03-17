import {AbstractOlvidClient} from "./gen/AbstractOlvidClient";
import { createGrpcWebTransport, type GrpcWebTransportOptions } from "@connectrpc/connect-web";
import * as datatypes from "./gen/olvid/daemon/datatypes/v1/datatypes";
import {create} from "@bufbuild/protobuf";

// noinspection HttpUrlsUsage
export default class OlvidClient extends AbstractOlvidClient {
    constructor(options: {grpcWebProxyUrl?: string, clientKey?: string} = {}) {
        let grpcWebProxyUrl: string = options.grpcWebProxyUrl ?? "http://localhost:8080";
        // add http or https prefix in grpcWebProxyUrl if necessary
        if (!grpcWebProxyUrl.startsWith("http://") && !grpcWebProxyUrl.startsWith("https://")) {
            grpcWebProxyUrl = `http://${grpcWebProxyUrl}`;
        }

        let transportOptions: GrpcWebTransportOptions = {
            baseUrl: grpcWebProxyUrl,
            useBinaryFormat: true,
        }

        super(createGrpcWebTransport, transportOptions, options.clientKey, grpcWebProxyUrl);
    }

    // client side streaming methods are not supported in web browsers

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
        identitySettings.invitation = invitation;
        await this.settingsIdentitySet({identitySettings});
    }

    // noinspection JSUnusedGlobalSymbols
    public async enableKeycloakAutoInvite(options: { autoInviteNewMembers?: boolean}) {
        let keycloak: datatypes.IdentitySettings_Keycloak = create(datatypes.IdentitySettings_KeycloakSchema, options);
        let identitySettings: datatypes.IdentitySettings = await this.settingsIdentityGet()
        identitySettings.keycloak = keycloak;
        await this.settingsIdentitySet({identitySettings});
    }

    // noinspection JSUnusedGlobalSymbols
    public async setMessageRetentionPolicy(options: {existenceDuration?: bigint, discussionCount?: bigint, globalCount?: bigint, cleanLockedDiscussions?: boolean, preserveIsSharingLocationMessages?: boolean}) {
        let messageRetention: datatypes.IdentitySettings_MessageRetention = create(datatypes.IdentitySettings_MessageRetentionSchema, options);
        let identitySettings: datatypes.IdentitySettings = await this.settingsIdentityGet()
        identitySettings.messageRetention = messageRetention;
        await this.settingsIdentitySet({identitySettings});
    }
}
