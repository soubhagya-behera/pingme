import Card from "../../ui/Card";
import {
    Database,
    Users,
    MessageCircle,
    UserPlus,
    HeartHandshake
} from "lucide-react";

export default function DatabaseStatisticsCard({ settings }) {

    const stats = [

        {
            title: "Total Users",
            value: settings.totalUsers,
            icon: Users
        },

        {
            title: "Friendships",
            value: settings.totalFriends,
            icon: HeartHandshake
        },

        {
            title: "Messages",
            value: settings.totalMessages,
            icon: MessageCircle
        },

        {
            title: "Friend Requests",
            value: settings.totalFriendRequests,
            icon: UserPlus
        }

    ];

    return (

        <Card className="p-6">

            <div className="flex items-center gap-3 mb-6">

                <Database
                    className="text-indigo-600"
                    size={26}
                />

                <h2 className="text-xl font-bold">

                    Database Statistics

                </h2>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

                {stats.map(item => (

                    <div
                        key={item.title}
                        className="rounded-xl border border-[var(--border)] p-5"
                    >

                        <div className="flex justify-between items-center">

                            <div>

                                <p className="text-sm text-[var(--text-secondary)]">

                                    {item.title}

                                </p>

                                <h3 className="mt-2 text-3xl font-bold">

                                    {item.value}

                                </h3>

                            </div>

                            <item.icon
                                size={30}
                                className="text-indigo-600"
                            />

                        </div>

                    </div>

                ))}

            </div>

        </Card>

    );

}