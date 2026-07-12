import Card from "../ui/Card";
import {
    Users,
    Wifi,
    Bell,
    MessageCircle
} from "lucide-react";

export default function StatsCards({ stats }) {

    const cards = [

        {
            title: "Friends",
            value: stats.totalFriends,
            icon: Users
        },

        {
            title: "Online",
            value: stats.onlineFriends,
            icon: Wifi
        },

        {
            title: "Requests",
            value: stats.pendingRequests,
            icon: Bell
        },

        {
            title: "Unread",
            value: stats.unreadMessages,
            icon: MessageCircle
        }

    ];

    return (

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">

            {

                cards.map(card => (

                    <Card
                        key={card.title}
                        hover
                        className="p-6"
                    >

                        <card.icon
                            size={28}
                            className="text-indigo-600 mb-4"
                        />

                        <h2 className="text-3xl font-bold">

                            {card.value}

                        </h2>

                        <p className="text-slate-500 mt-2">

                            {card.title}

                        </p>

                    </Card>

                ))

            }

        </div>

    );

}