import OlvidClient from "../OlvidClient";
import {Invitation, InvitationFilterSchema, Invitation_Status} from "../gen/olvid/daemon/datatypes/v1/datatypes";
import {create} from "@bufbuild/protobuf";

export default abstract class InvitationHelper {
    /**
     * Waits for this invitation to be deleted
     * @param client - The Olvid client instance
     * @param invitation concerned invitation
     * @returns Promise that resolves to the deleted invitation when it's deleted
     */
    public async waitForDeletion(client: OlvidClient, invitation: Invitation): Promise<Invitation> {
        return new Promise((resolve) => {
            client.onInvitationDeleted({
                callback: resolve,
                invitationIds: [invitation.id],
                count: BigInt(1)
            });
        });
    }

    /**
     * Waits for this invitation to be updated to a specific status or any status
     * @param client - The Olvid client instance
     * @param invitation concerned invitation
     * @param expectedStatus - Optional specific status to wait for. If not provided, waits for any update
     * @returns Promise that resolves to a tuple of [updated invitation, previous status]
     */
    public async waitForUpdate(client: OlvidClient, invitation: Invitation, expectedStatus?: Invitation_Status): Promise<[Invitation, Invitation_Status]> {
        return new Promise((resolve) => {
            client.onInvitationUpdated({
                callback: (invitation: Invitation, previousStatus: Invitation_Status) => {
                    resolve([invitation, previousStatus]);
                },
                invitationIds: [invitation.id],
                filter: expectedStatus ? create(InvitationFilterSchema, { status: expectedStatus }) : undefined,
                count: BigInt(1)
            });
        });
    }

    /**
     * Sets up a persistent listener for invitation deletion events
     * @param client - The Olvid client instance
     * @param invitation concerned invitation
     * @param handler - Callback function to execute when the invitation is deleted
     * @returns Function to cancel the event listener
     */
    public onDeletion(client: OlvidClient, invitation: Invitation, handler: (invitation: Invitation) => Promise<void> | void): Function {
        return client.onInvitationDeleted({
            callback: handler,
            invitationIds: [invitation.id]
        });
    }

    /**
     * Sets up a persistent listener for invitation update events
     * @param client - The Olvid client instance
     * @param invitation concerned invitation
     * @param handler - Callback function to execute when the invitation is updated
     * @param expectedStatus - Optional specific status to listen for. If not provided, listens for any update
     * @returns Function to cancel the event listener
     */
    public onUpdate(client: OlvidClient, invitation: Invitation, handler: (invitation: Invitation, previousStatus: Invitation_Status) => Promise<void> | void, expectedStatus?: Invitation_Status): Function {
        return client.onInvitationUpdated({
            callback: handler,
            invitationIds: [invitation.id],
            filter: expectedStatus ? create(InvitationFilterSchema, { status: expectedStatus }) : undefined
        });
    }
}
