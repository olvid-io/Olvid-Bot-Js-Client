import AttachmentHelper from "./AttachmentHelper";
import ContactHelper from "./ContactHelper";
import DiscussionHelper from "./DiscussionHelper";
import GroupHelper from "./GroupHelper";
import IdentityHelper from "./IdentityHelper";
import InvitationHelper from "./InvitationHelper";
import MessageHelper from "./MessageHelper";
import {type AttachmentId, AttachmentId_Type, type MessageId, MessageId_Type} from "../gen/olvid/daemon/datatypes/v1/datatypes";


export abstract class helpers {
    public static attachment = AttachmentHelper;
    public static contact = ContactHelper;
    public static discussion = DiscussionHelper;
    public static group = GroupHelper;
    public static identity = IdentityHelper;
    public static invitation = InvitationHelper;
    public static message = MessageHelper;

    // check message/attachment id equality
    public static idEqual<Id extends AttachmentId|MessageId>(a: Id, b: Id) {
        return a.type === b.type && a.id === b.id;
    }

    // convert a message/attachment id to a more compact value: "I10" / "O10"
    public static idToString(id: AttachmentId|MessageId) {
        if (id.$typeName === "olvid.daemon.datatypes.v1.AttachmentId") {
            return `${id.type === AttachmentId_Type.INBOUND ? 'I' : 'O'}${id.id}`;
        }
        if (id.$typeName === "olvid.daemon.datatypes.v1.MessageId") {
            return `${id.type === MessageId_Type.INBOUND ? 'I' : 'O'}${id.id}`;
        }
    }
}
