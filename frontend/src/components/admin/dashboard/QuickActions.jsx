import Card from "../../ui/Card";
import { Users, UserPlus, MessageSquare, Settings } from "lucide-react";

const actions = [
    {
        title: "Manage Users",
        icon: Users,
    },
    {
        title: "Pending Users",
        icon: UserPlus,
    },
    {
        title: "View Queries",
        icon: MessageSquare,
    },
    {
        title: "Settings",
        icon: Settings,
    },
];

export default function QuickActions() {
    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
                Quick Actions
            </h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {actions.map((item) => (
                    <button
                        key={item.title}
                        className="rounded-xl border p-5 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                    >
                        <item.icon
                            className="mx-auto text-indigo-600"
                            size={32}
                        />

                        <p className="mt-3 font-medium">
                            {item.title}
                        </p>
                    </button>
                ))}
            </div>
        </Card>
    );
}