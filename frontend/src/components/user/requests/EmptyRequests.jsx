import Card from "../../ui/Card";
import { Inbox } from "lucide-react";

export default function EmptyRequests() {

    return (

        <Card className="p-12 text-center">

            <Inbox

                size={60}

                className="mx-auto text-slate-400"

            />

            <h2 className="text-2xl font-bold mt-5">

                No Pending Requests

            </h2>

            <p className="text-slate-500 mt-3">

                Friend requests will appear here when someone sends you one.

            </p>

        </Card>

    );

}