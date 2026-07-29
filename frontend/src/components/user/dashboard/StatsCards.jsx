import Card from "../../ui/Card";
import {
    Users,
    Wifi,
    Bell,
    MessageCircle,
    ArrowUpRight
} from "lucide-react";

export default function StatsCards({ stats }) {

    const cards = [

        {
            title: "Friends",
            value: stats.totalFriends,
            subtitle: "People connected",
            footer: `${stats.onlineFriends} online`,
            color: "from-indigo-500 to-violet-500",
            icon: Users
        },

        {
            title: "Online",
            value: stats.onlineFriends,
            subtitle: "Active now",
            footer: "Live status",
            color: "from-green-500 to-emerald-500",
            icon: Wifi
        },

        {
            title: "Requests",
            value: stats.pendingRequests,
            subtitle: "Awaiting response",
            footer: "Review now",
            color: "from-amber-500 to-orange-500",
            icon: Bell
        },

        {
            title: "Unread",
            value: stats.unreadMessages,
            subtitle: "Messages waiting",
            footer: "Open chats",
            color: "from-pink-500 to-fuchsia-500",
            icon: MessageCircle
        }

    ];

    return (

        <div className="dashboard-stats-grid">

            {

                cards.map((card) => (

                    <Card
                        key={card.title}
                        hover
                        className="dashboard-stat-card"
                    >

                        <div className="dashboard-stat-top">

                            <div className={`dashboard-stat-icon bg-gradient-to-r ${card.color}`}>

                                <card.icon size={24} />

                            </div>

                            <ArrowUpRight
                                size={18}
                                className="dashboard-arrow"
                            />

                        </div>

                        <h3 className="dashboard-value">

                            {card.value}

                        </h3>

                        <h4 className="dashboard-card-title">

                            {card.title}

                        </h4>

                        <p className="dashboard-card-subtitle">

                            {card.subtitle}

                        </p>

                        <div className="dashboard-card-footer">

                            {card.footer}

                        </div>

                    </Card>

                ))

            }

        </div>

    );

}