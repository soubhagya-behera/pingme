import Card from "../../ui/Card";
import Button from "../../ui/Button";
import FriendService from "../../../services/FriendService";
import {
    UserPlus,
    Sparkles
} from "lucide-react";

export default function PendingRequests({ requests }) {

    async function accept(id) {

        await FriendService.acceptRequest(id);

        window.location.reload();

    }

    async function reject(id) {

        await FriendService.rejectRequest(id);

        window.location.reload();

    }

    return (

        <Card className="pending-card">

            <div className="pending-header">

                <div>

                    <h2>

                        Friend Requests

                    </h2>

                    <p>

                        People waiting to connect with you

                    </p>

                </div>

            </div>

            {

                requests.length === 0 ?

                (

                    <div className="pending-empty">

                        <Sparkles size={48}/>

                        <h3>

                            You're all caught up 🎉

                        </h3>

                        <p>

                            No pending requests right now.

                        </p>

                    </div>

                )

                :

                requests.map(request => (

                    <div

                        key={request.requestId}

                        className="pending-item"

                    >

                        <div className="pending-avatar">

                            {request.senderName.charAt(0)}

                        </div>

                        <div className="pending-info">

                            <h3>

                                {request.senderName}

                            </h3>

                            <p>

                                Wants to connect with you

                            </p>

                        </div>

                        <div className="pending-actions">

                            <Button

                                onClick={() => accept(request.requestId)}

                            >

                                Accept

                            </Button>

                            <button

                                className="ignore-btn"

                                onClick={() => reject(request.requestId)}

                            >

                                Ignore

                            </button>

                        </div>

                    </div>

                ))

            }

        </Card>

    );

}