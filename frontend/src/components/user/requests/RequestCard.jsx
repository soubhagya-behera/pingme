import Card from "../../ui/Card";
import Button from "../../ui/Button";

export default function RequestCard({

    request,

    onAccept,

    onReject

}) {

    return (

        <Card
            hover
            className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >

            <div className="flex gap-4 items-center">

                <div
                    className="relative w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold"
                >

                    {

                        request.senderName

                            .charAt(0)

                            .toUpperCase()

                    }

                    <span

                        className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                            request.senderOnline
                                ? "bg-green-500"
                                : "bg-gray-400"
                        }`}

                    />

                </div>

                <div>

                    <h2 className="text-xl font-semibold">

                        {request.senderName}

                    </h2>

                    <p className="text-slate-500">

                        {

                            request.senderProfession ||

                            "No Profession"

                        }

                    </p>

                    <p className="text-sm text-slate-400">

                        {request.senderEmail}

                    </p>

                </div>

            </div>

            <div className="flex gap-3">

                <Button

                    onClick={() =>

                        onAccept(

                            request.requestId

                        )

                    }

                >

                    Accept

                </Button>

                <Button

                    variant="danger"

                    onClick={() =>

                        onReject(

                            request.requestId

                        )

                    }

                >

                    Reject

                </Button>

            </div>

        </Card>

    );

}