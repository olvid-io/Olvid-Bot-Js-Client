// Re-export the ConnectError class
import { ConnectError, Code } from "@connectrpc/connect";
export class OlvidError extends ConnectError { }
export const OlvidErrorCode = Code;