import {AbstractOlvidAdminClient} from "./gen/AbstractOlvidAdminClient";
import { createGrpcWebTransport, type GrpcWebTransportOptions } from "@connectrpc/connect-web";

// noinspection HttpUrlsUsage
export default class OlvidAdminClient extends AbstractOlvidAdminClient {
    constructor(options: {grpcWebProxyUrl?: string, clientKey?: string, currentIdentityId?: number, useHttps?: boolean}) {
        let grpcWebProxyUrl: string = options.grpcWebProxyUrl ?? "http://localhost:8080";
        // add http or https prefix in grpcWebProxyUrl if necessary
        if (!grpcWebProxyUrl.startsWith("http://") && !grpcWebProxyUrl.startsWith("https://")) {
            grpcWebProxyUrl = options.useHttps ? `https://${grpcWebProxyUrl}` : `http://${grpcWebProxyUrl}`;
        }

        let transportOptions: GrpcWebTransportOptions = {
            baseUrl: grpcWebProxyUrl,
            useBinaryFormat: true
        }

        super(createGrpcWebTransport, transportOptions, options.clientKey, grpcWebProxyUrl, options.currentIdentityId);
    }
}
