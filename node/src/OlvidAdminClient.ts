import {AbstractOlvidAdminClient} from "./gen/AbstractOlvidAdminClient";
import {createGrpcTransport, type GrpcTransportOptions} from "@connectrpc/connect-node";

// noinspection HttpUrlsUsage
export default class OlvidAdminClient extends AbstractOlvidAdminClient {
 	constructor(options: {daemonUrl?: string, clientKey?: string, currentIdentityId?: number, useHttps?: boolean} = {}) {
		// load config from env if .env file exists
		try {
			process.loadEnvFile()
		} catch (ignored) {}

		let daemonUrl: string = options.daemonUrl ?? process.env.OLVID_DAEMON_URL ?? "http://localhost:50051";
		// add http or https prefix in serverUrl if necessary
		if (!daemonUrl.startsWith("http://") && !daemonUrl.startsWith("https://")) {
			daemonUrl = options.useHttps ? `https://${daemonUrl}` : `http://${daemonUrl}`;
		}
		let clientKey: string|undefined = options.clientKey ?? process.env.OLVID_ADMIN_CLIENT_KEY;

		let transportOptions: GrpcTransportOptions = {
			baseUrl: daemonUrl,
			useBinaryFormat: true,
		}
		super(createGrpcTransport, transportOptions, clientKey, daemonUrl, options.currentIdentityId);
	}
}
