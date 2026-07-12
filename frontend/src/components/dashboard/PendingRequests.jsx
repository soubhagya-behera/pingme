import Card from "../ui/Card";
import Button from "../ui/Button";
import FriendService from "../../services/FriendService";

export default function PendingRequests({

    requests

}) {

    async function accept(id) {

        await FriendService.acceptRequest(id);

        window.location.reload();

    }

    async function reject(id) {

        await FriendService.rejectRequest(id);

        window.location.reload();

    }

    return (

        <Card className="mt-8 p-6">

            <h2 className="text-2xl font-bold mb-5">

                Pending Requests

            </h2>

            {

                requests.length === 0 ?

                    (

                        <p className="text-slate-400">

                            No pending requests.

                        </p>

                    )

                    :

                    requests.map(request => (

                        <div

                            key={request.requestId}

                            className="flex justify-between items-center border-b py-4 last:border-0"

                        >

                            <div>

                                <h3 className="font-semibold">

                                    {request.senderName}

                                </h3>

                                <p className="text-sm text-slate-500">

                                    Wants to connect

                                </p>

                            </div>

                            <div className="flex gap-2">

                                <Button

                                    onClick={() => accept(request.requestId)}

                                >

                                    Accept

                                </Button>

                                <Button

                                    onClick={() => reject(request.requestId)}

                                >

                                    Reject

                                </Button>

                            </div>

                        </div>

                    ))

            }

        </Card>

    );

}