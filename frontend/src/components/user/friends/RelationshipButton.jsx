import Button from "../../ui/Button";

export default function RelationshipButton({

    user,

    sending,

    onSend,

    onAccept,

    onReject,

    onCancel

}) {

    switch (user.relationshipStatus) {

        case "NOT_FRIEND":

            return (

                <Button

                    disabled={sending}

                    onClick={() => onSend(user)}

                >

                    Add Friend

                </Button>

            );

        case "PENDING_SENT":

            return (

                <Button

                    variant="secondary"

                    disabled={sending}

                    onClick={() => onCancel(user)}

                >

                    Cancel

                </Button>

            );

        case "PENDING_RECEIVED":

            return (

                <div className="flex gap-2">

                    <Button

                        disabled={sending}

                        onClick={() => onAccept(user)}

                    >

                        Accept

                    </Button>

                    <Button

                        variant="danger"

                        disabled={sending}

                        onClick={() => onReject(user)}

                    >

                        Reject

                    </Button>

                </div>

            );

        case "FRIENDS":

            return (

                <Button

                    variant="ghost"

                    disabled

                >

                    Friends

                </Button>

            );

        default:

            return null;

    }

}