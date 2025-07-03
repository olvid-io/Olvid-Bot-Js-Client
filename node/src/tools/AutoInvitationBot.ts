import {OlvidClient} from "../olvid";
import {Invitation, Invitation_Status} from "../gen/olvid/daemon/datatypes/v1/invitation_pb";

export default class AutoInvitationBot extends OlvidClient{
    public readonly invitationCallback = (invitation: Invitation) => this.acceptInvitation(invitation);

    constructor(options: {serverUrl?: string, clientKey?: string} = {}) {
        super(options);

        this.onInvitationReceived({callback: this.invitationCallback});
        this.onInvitationUpdated({callback: this.invitationCallback});

        this.acceptAllPendingInvitations().then();
    }

    public async acceptAllPendingInvitations() {
        for await (let invitation of this.invitationList()) {
            await this.acceptInvitation(invitation);
        }
    }

    public async acceptInvitation(invitation: Invitation) {
        const status = invitation.status;
        if (status == Invitation_Status.INVITATION_WAIT_YOU_TO_ACCEPT
            || status == Invitation_Status.INTRODUCTION_WAIT_YOU_TO_ACCEPT
            || status == Invitation_Status.ONE_TO_ONE_INVITATION_WAIT_YOU_TO_ACCEPT
            || status == Invitation_Status.GROUP_INVITATION_WAIT_YOU_TO_ACCEPT) {
            await this.invitationAccept({invitationId: invitation.id});
        }
    }
}
