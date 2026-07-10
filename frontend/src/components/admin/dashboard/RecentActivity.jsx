import Card from "../../ui/Card";
import {
    CheckCircle2,
    XCircle,
    Mail,
    Trash2,
    UserPlus
} from "lucide-react";

const activities = [

    {
        id: 1,
        icon: CheckCircle2,
        color: "text-green-600",
        title: "User Approved",
        description: "Rahul Kumar was approved",
        time: "2 mins ago"
    },

    {
        id: 2,
        icon: XCircle,
        color: "text-red-600",
        title: "User Rejected",
        description: "Alex Johnson was rejected",
        time: "12 mins ago"
    },

    {
        id: 3,
        icon: Mail,
        color: "text-indigo-600",
        title: "Activation Email Sent",
        description: "Activation email sent to John",
        time: "25 mins ago"
    },

    {
        id: 4,
        icon: Trash2,
        color: "text-red-500",
        title: "User Deleted",
        description: "Demo Account removed",
        time: "1 hour ago"
    },

    {
        id: 5,
        icon: UserPlus,
        color: "text-amber-500",
        title: "New Registration",
        description: "A new user joined PingMe",
        time: "2 hours ago"
    }

];

export default function RecentActivity() {

    return (

        <Card className="p-6">

            <h2 className="text-xl font-semibold mb-6">

                Recent Activity

            </h2>

            <div className="space-y-5">

                {activities.map(activity => (

                    <div
                        key={activity.id}
                        className="flex gap-4"
                    >

                        <div
                            className={activity.color}
                        >

                            <activity.icon size={22} />

                        </div>

                        <div className="flex-1">

                            <p className="font-semibold">

                                {activity.title}

                            </p>

                            <p className="text-sm text-[var(--text-secondary)]">

                                {activity.description}

                            </p>

                        </div>

                        <span
                            className="text-xs text-[var(--text-secondary)]"
                        >

                            {activity.time}

                        </span>

                    </div>

                ))}

            </div>

        </Card>

    );

}