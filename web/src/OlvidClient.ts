import {AbstractOlvidClient} from "./gen/AbstractOlvidClient";
import { createGrpcWebTransport, type GrpcWebTransportOptions } from "@connectrpc/connect-web";

// noinspection HttpUrlsUsage
export default class OlvidClient extends AbstractOlvidClient {
    constructor(options: {serverUrl?: string, clientKey?: string} = {}) {
        let serverUrl: string = options.serverUrl ?? "localhost:8080";
        // add http or https prefix in serverUrl if necessary
        if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
            serverUrl = `http://${serverUrl}`;
        }

        let transportOptions: GrpcWebTransportOptions = {
            baseUrl: serverUrl,
            useBinaryFormat: true,
        }

        super(createGrpcWebTransport, transportOptions, options.clientKey, serverUrl);
    }

    // client side streaming methods are not supported in web browsers
}
