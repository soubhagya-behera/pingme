import {
    LayoutDashboard,
    MessageCircle,
    Users,
    Bell,
    Settings,
    ShieldCheck
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const userMenus = [

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

const adminMenus = [

    {
        icon: ShieldCheck,
        label: "Admin",
        path: "/admin"
    },

    {
        icon: Settings,
        label: "Settings",
        path: "/settings"
    }

];

export default function Sidebar(){

    const { user } = useAuth();

    const menus = user?.role === "ADMIN" ? adminMenus : userMenus;

    return(

        <aside className="hidden lg:flex w-72 flex-col border-r border-[var(--border)] bg-[var(--card)]">

            <div className="p-6">

                <h1 className="text-3xl font-bold text-indigo-600">

                    PingMe

                </h1>

            </div>

            <nav className="flex-1 px-4 space-y-2">

                {

                    menus.map(item=>(

                        <NavLink

                            key={item.label}

                            to={item.path}

                            className={({isActive})=>

                                `

                                flex items-center gap-4

                                rounded-xl

                                px-4 py-3

                                transition-all

                                ${

                                    isActive

                                    ?

                                    "bg-indigo-600 text-white shadow-lg"

                                    :

                                    "text-[var(--text)] hover:bg-indigo-50 dark:hover:bg-slate-800"

                                }

                                `

                            }

                        >

                            <item.icon size={22}/>

                            <span>

                                {item.label}

                            </span>

                        </NavLink>

                    ))

                }

            </nav>

        </aside>

    );

}
