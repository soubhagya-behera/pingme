import Card from "../ui/Card";

export default function PendingRequests(){

    return(

        <Card className="mt-8 p-6">

            <h2 className="text-2xl font-bold">

                Pending Requests

            </h2>

            <p className="mt-5 text-slate-500">

                No pending requests.

            </p>

        </Card>

    );

}