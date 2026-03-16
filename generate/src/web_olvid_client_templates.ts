export const olvidClientTemplate = `import {
    CallbackClient,
    Client,
    createCallbackClient,
    createClient,
    type Interceptor,
    Transport
} from "@connectrpc/connect";
import { ConnectError, Code } from "@connectrpc/connect";
import * as datatypes from "./olvid/daemon/datatypes/v1/datatypes";
import * as services from "./olvid/daemon/services/v1/services";
import * as command from "./olvid/daemon/command/v1/command";
import * as notification from "./olvid/daemon/notification/v1/notification";
import EventEmitter from "events";

export abstract class AbstractOlvidClient {
    public readonly clientKey?: string;
    public readonly grpcWebProxyUrl?: string;

    protected readonly transport: Transport;

    // Used to stop all the running callbacks when we stop the client
    protected callbacksAbort: AbortController;
    // Keep a set of every running callback
    protected activeCallbacks: Set<string> = new Set();
    // Emit an event when a callback ends
    protected callbackUpdate: EventEmitter = new EventEmitter();

    // Used to keep the client alive, even if no callbacks are registered
    protected lifecycleWorker?: EmptyWorker;
    // Used to stop the EmptyWorker when used runForever
    protected lifecycleAbort?: AbortController;

    public readonly stubs: {
//@CLIENT_STUB_DECLARATION@
    };

    protected constructor(transportCreationMethod: (options: any) => Transport, transportOptions: any, clientKey?: string, grpcWebProxyUrl?: string) {
        this.clientKey = clientKey;
        this.grpcWebProxyUrl = grpcWebProxyUrl;

        transportOptions.interceptors ?
            transportOptions.interceptors.push(this.getAuthenticationInterceptor())
            : transportOptions.interceptors = [this.getAuthenticationInterceptor()]

        this.transport = transportCreationMethod(transportOptions);

        this.stubs = {
//@CLIENT_STUB_CREATION@
        };

        // create the callback abort controller
        this.callbacksAbort = new AbortController();
    }

    protected getAuthenticationInterceptor(): Interceptor {
        return (next) => async (req) => {
            let metadata: Map<string, string> = this.getMetadata();
            metadata.forEach((value, key) => {
                req.header.set(key, value);
            })
            return await next(req);
        };
    }

    protected getMetadata(): Map<string, string> {
        const metadata = new Map();
        if (this.clientKey) {
            metadata.set("daemon-client-key", this.clientKey)
        }
        return metadata;
    }

    /**
     * Check if an error is a connection error that should cause the client to stop
     */
    private isConnectionError(error: Error): boolean {
        if (error instanceof ConnectError) {
            return error.code === Code.Unavailable ||
                   error.code === Code.DeadlineExceeded ||
                   error.code === Code.Unauthenticated ||
                   error.code === Code.Canceled ||
                   error.code === Code.Unknown;
        }
        return false;
    }

    /**
     * Wait for all the callbacks registered in the client to end
     * (unless connection to daemon is lost)
     * Note: It doesn't stop the client, use stop() instead
     */
    public async waitForCallbacksEnd() {
        // Wait for all callbacks to stop
        return new Promise<void>((resolve) => {
            this.callbackUpdate.on("removed", () => {
                if (this.activeCallbacks.size === 0) {
                    resolve();
                }
            });

            this.callbackUpdate.on("stopped", () => {
                resolve();
            });
        });
    }

    /**
     * Run the client forever (unless connection to daemon is lost)
     * Can be stopped using this.stop()
     */
    public async runForever() {
        this.lifecycleAbort = new AbortController();
        this.lifecycleWorker = new EmptyWorker(this.lifecycleAbort.signal);
        await this.lifecycleWorker.run();
    }

    /**
     * Stop the client and all the running callbacks
     */
    public stop() {
        this.lifecycleAbort?.abort();
        this.callbacksAbort.abort();
        this.callbackUpdate.emit("stopped");
    }

//@CLIENT_METHODS@
}

class EmptyWorker {
    private signal: AbortSignal;

    constructor(signal: AbortSignal) {
        this.signal = signal;
    }

    public async run() {
        return new Promise((resolve) => {
            // Start new empty worker to keep the client alive
            const timeout = setInterval(() => {}, 2_147_483_647);

            this.signal.addEventListener("abort", () => {
                clearInterval(timeout);
                resolve(void 0);
            });
        });
    }
}`;

export const olvidAdminClientTemplate = `import {
    Client, createClient, type Transport,
} from "@connectrpc/connect";
import * as services from "./olvid/daemon/services/v1/services";
import * as datatypes from "./olvid/daemon/datatypes/v1/datatypes";
import * as admin from "./olvid/daemon/admin/v1/admin";
import {AbstractOlvidClient} from "./AbstractOlvidClient";

export abstract class AbstractOlvidAdminClient extends AbstractOlvidClient {
    public currentIdentityId: number;

    public readonly adminStubs: {
//@ADMIN_CLIENT_STUB_DECLARATION@
    };

    protected constructor(transportCreationMethod: (options: any) => Transport, transportOptions: any, clientKey?: string, grpcWebProxyUrl?: string, currentIdentityId: number = 0) {
        super(transportCreationMethod, transportOptions, clientKey, grpcWebProxyUrl);
        this.currentIdentityId = currentIdentityId ?? 0;
        this.adminStubs = {
//@ADMIN_CLIENT_STUB_CREATION@
        };
    }

    protected override getMetadata(): Map<string, string> {
        const metadata = new Map();
        if (this.clientKey) {
            metadata.set("daemon-client-key", this.clientKey);
        }
        if (this.currentIdentityId) {
            metadata.set("daemon-identity-id", this.currentIdentityId);
        }
        return metadata;
    }

//@ADMIN_CLIENT_METHODS@

}`