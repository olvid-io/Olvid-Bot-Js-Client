import {AbstractOlvidAdminClient} from "./gen/AbstractOlvidAdminClient";
import { createGrpcWebTransport, type GrpcWebTransportOptions } from "@connectrpc/connect-web";

// noinspection HttpUrlsUsage
export default class OlvidAdminClient extends AbstractOlvidAdminClient {
    constructor(options: {serverUrl?: string, clientKey?: string, currentIdentityId?: number, useHttps?: boolean}) {
        let serverUrl: string = options.serverUrl ?? "localhost:8080";
        // add http or https prefix in serverUrl if necessary
        if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
            serverUrl = options.useHttps ? `https://${serverUrl}` : `http://${serverUrl}`;
        }

        let transportOptions: GrpcWebTransportOptions = {
            baseUrl: serverUrl,
            useBinaryFormat: true
        }

        super(createGrpcWebTransport, transportOptions, options.clientKey, serverUrl, options.currentIdentityId);
    }
}
