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

            <p className="mt-3 text-[var(--text-secondary)]">

                New friend requests will automatically appear here.

            </p>

            <p className="mt-2 text-sm text-[var(--text-secondary)] opacity-80">

                Search people from the Friends page to grow your network.

            </p>

        </Card>

    );

}