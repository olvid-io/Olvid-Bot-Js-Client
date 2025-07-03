import OlvidClient from ".././../../../../OlvidClient";
import { Invitation, InvitationFilter, Invitation_Status } from "../../../../../gen/olvid/daemon/datatypes/v1/invitation_pb";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedInvitation extends Invitation {
    /**
     * Waits for this invitation to be deleted
     * @param client - The Olvid client instance
     * @returns Promise that resolves to the deleted invitation when it's deleted
     */
    public async waitForDeletion(client: OlvidClient): Promise<Invitation> {
        return new Promise((resolve) => {
            client.onInvitationDeleted({
                callback: resolve,
                invitationIds: [this.id],
                count: BigInt(1)
            });
        });
    }

    /**
     * Waits for this invitation to be updated to a specific status or any status
     * @param client - The Olvid client instance
     * @param expectedStatus - Optional specific status to wait for. If not provided, waits for any update
     * @returns Promise that resolves to a tuple of [updated invitation, previous status]
     */
    public async waitForUpdate(client: OlvidClient, expectedStatus?: Invitation_Status): Promise<[Invitation, Invitation_Status]> {
        return new Promise((resolve) => {
            client.onInvitationUpdated({
                callback: (invitation: Invitation, previousStatus: Invitation_Status) => {
                    resolve([invitation, previousStatus]);
                },
                invitationIds: [this.id],
                filter: expectedStatus ? new InvitationFilter({ status: expectedStatus }) : undefined,
                count: BigInt(1)
            });
        });
    }

    /**
     * Sets up a persistent listener for invitation deletion events
     * @param client - The Olvid client instance
     * @param handler - Callback function to execute when the invitation is deleted
     * @returns Function to cancel the event listener
     */
    public onDeletion(client: OlvidClient, handler: (invitation: Invitation) => Promise<void> | void): Function {
        return client.onInvitationDeleted({
            callback: handler,
            invitationIds: [this.id]
        });
    }

    /**
     * Sets up a persistent listener for invitation update events
     * @param client - The Olvid client instance
     * @param handler - Callback function to execute when the invitation is updated
     * @param expectedStatus - Optional specific status to listen for. If not provided, listens for any update
     * @returns Function to cancel the event listener
     */
    public onUpdate(client: OlvidClient, handler: (invitation: Invitation, previousStatus: Invitation_Status) => Promise<void> | void, expectedStatus?: Invitation_Status): Function {
        return client.onInvitationUpdated({
            callback: handler,
            invitationIds: [this.id],
            filter: expectedStatus ? new InvitationFilter({ status: expectedStatus }) : undefined
        });
    }
}