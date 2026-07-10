import Card from "../../ui/Card";
import {
    Users,
    UserPlus,
    MessageSquare,
    Settings
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const actions = [

    {
        title: "Manage Users",
        icon: Users,
        path: "/admin/users"
    },

    {
        title: "Pending Users",
        icon: UserPlus,
        path: "/admin/users?status=PENDING"
    },

    {
        title: "View Queries",
        icon: MessageSquare,
        path: "/admin/queries"
    },

    {
        title: "Settings",
        icon: Settings,
        path: "/admin/settings"
    }

];

export default function QuickActions() {

    const navigate = useNavigate();

    return (

        <Card className="p-6">

            <h2 className="mb-6 text-xl font-semibold">

                Quick Actions

            </h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                {

                    actions.map(item => (

                        <button

                            key={item.title}

                            onClick={() => navigate(item.path)}

                            className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg"

                        >

                            <item.icon

                                className="mx-auto text-indigo-600 transition-transform duration-300 group-hover:scale-110"

                                size={34}

                            />

                            <p className="mt-4 font-semibold">

                                {item.title}

                            </p>

                        </button>

                    ))

                }

            </div>

        </Card>

    );

}