import {
    LayoutDashboard,
    MessageCircle,
    Users,
    Bell,
    Settings
} from "lucide-react";

export const userMenus = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/"
    },
    {
        icon: MessageCircle,
        label: "Chats",
        path: "/chat"
    },
    {
        icon: Users,
        label: "Friends",
        path: "/friends"
    },
    {
        icon: Bell,
        label: "Requests",
        path: "/requests"
    },
    {
        icon: Settings,
        label: "Settings",
        path: "/settings"
    }
];

export const adminMenus = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/admin/dashboard"
    },
    {
        icon: Users,
        label: "Users",
        path: "/admin/users"
    },
    {
        icon: MessageCircle,
        label: "Queries",
        path: "/admin/queries"
    },
    {
        icon: Settings,
        label: "Settings",
        path: "/admin/settings"
    }
];
