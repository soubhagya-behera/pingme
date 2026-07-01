import {
    LayoutDashboard,
    MessageCircle,
    Users,
    Bell,
    Settings
} from "lucide-react";

const menus = [

    {
        icon: LayoutDashboard,
        label: "Dashboard"
    },

    {
        icon: MessageCircle,
        label: "Chats"
    },

    {
        icon: Users,
        label: "Friends"
    },

    {
        icon: Bell,
        label: "Requests"
    },

    {
        icon: Settings,
        label: "Settings"
    }

];

export default function Sidebar() {

    return (

        <aside
            className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white"
        >

            <div className="p-6">

                <h1 className="text-3xl font-bold text-indigo-600">

                    PingMe

                </h1>

            </div>

            <nav className="flex-1 px-4 space-y-2">

                {

                    menus.map((item) => (

                        <button

                            key={item.label}

                            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-600"

                        >

                            <item.icon size={22}/>

                            {item.label}

                        </button>

                    ))

                }

            </nav>

        </aside>

    );

}