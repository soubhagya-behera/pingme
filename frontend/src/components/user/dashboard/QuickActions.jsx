import { useNavigate } from "react-router-dom";

import {
    MessageCircle,
    Users,
    Bell,
    Settings,
    ArrowUpRight
} from "lucide-react";

import Card from "../../ui/Card";

export default function QuickActions() {

    const navigate = useNavigate();

    const actions = [

        {
            title: "New Chat",
            subtitle: "Continue chatting",
            icon: MessageCircle,
            color: "from-indigo-500 to-violet-500",
            path: "/chat"
        },

        {
            title: "Friends",
            subtitle: "View your network",
            icon: Users,
            color: "from-cyan-500 to-blue-500",
            path: "/friends"
        },

        {
            title: "Requests",
            subtitle: "Pending invitations",
            icon: Bell,
            color: "from-orange-500 to-amber-500",
            path: "/requests"
        },

        {
            title: "Settings",
            subtitle: "Manage account",
            icon: Settings,
            color: "from-emerald-500 to-green-500",
            path: "/settings"
        }

    ];

    return (

        <Card className="quick-actions-card">

            <div className="quick-actions-header">

                <h2>

                    Quick Actions

                </h2>

                <p>

                    Jump to the features you use most.

                </p>

            </div>

            <div className="quick-actions-grid">

                {

                    actions.map(action => (

                        <button

                            key={action.title}

                            onClick={() => navigate(action.path)}

                            className="quick-action"

                        >

                            <div className={`quick-action-icon bg-gradient-to-r ${action.color}`}>

                                <action.icon size={24}/>

                            </div>

                            <div className="quick-action-content">

                                <h3>

                                    {action.title}

                                </h3>

                                <span>

                                    {action.subtitle}

                                </span>

                            </div>

                            <ArrowUpRight

                                className="quick-action-arrow"

                                size={18}

                            />

                        </button>

                    ))

                }

            </div>

        </Card>

    );

}