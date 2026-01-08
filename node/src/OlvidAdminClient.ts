import {AbstractOlvidAdminClient} from "./gen/AbstractOlvidAdminClient";
import {createGrpcTransport, type GrpcTransportOptions} from "@connectrpc/connect-node";

// noinspection HttpUrlsUsage
export default class OlvidAdminClient extends AbstractOlvidAdminClient {
 	constructor(options: {serverUrl?: string, clientKey?: string, currentIdentityId?: number, useHttps?: boolean} = {}) {
		// load config from env if .env file exists
		try {
			process.loadEnvFile()
		} catch (ignored) {}

		let serverUrl: string = options.serverUrl ?? process.env.OLVID_DAEMON_TARGET ?? "localhost:50051";
		// add http or https prefix in serverUrl if necessary
		if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
			serverUrl = options.useHttps ? `https://${serverUrl}` : `http://${serverUrl}`;
		}
		let clientKey: string|undefined = options.clientKey ?? process.env.OLVID_ADMIN_CLIENT_KEY;

		let transportOptions: GrpcTransportOptions = {
			baseUrl: serverUrl,
			useBinaryFormat: true,
		}
		super(createGrpcTransport, transportOptions, clientKey, serverUrl, options.currentIdentityId);
	}
}
