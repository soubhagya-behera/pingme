import Card from "../ui/Card";
import { Users, Wifi, Bell } from "lucide-react";

export default function StatsCards({

    friends,

    requests

}) {

    const stats = [

    {
        title: "Friends",
        value: friends,
        icon: Users
    },

    {
        title: "Online",
        value: 0,
        icon: Wifi
    },

    {
        title: "Requests",
        value: requests,
        icon: Bell
    }

];

    return (

        <div className="grid gap-6 md:grid-cols-3">

            {

                stats.map((item) => (

                    <Card
                        key={item.title}
                        className="p-6"
                        hover
                    >

                        <item.icon
                            className="mb-4"
                            size={32}
                        />

                        <h2 className="text-3xl font-bold">

                            {item.value}

                        </h2>

                        <p className="mt-2">

                            {item.title}

                        </p>

                    </Card>

                ))

            }

        </div>

    );

}