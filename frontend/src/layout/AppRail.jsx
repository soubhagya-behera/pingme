import { NavLink } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import ThemeToggle from "../components/ui/ThemeToggle";
import ProfileDropdown from "../components/ui/ProfileDropdown";
import NotificationBell from "../components/user/notifications/NotificationBell";
import { useAuth } from "../context/AuthContext";
import { userMenus, adminMenus } from "./navigation";

export default function AppRail() {

    const { user } = useAuth();

    const menus = user?.role === "ADMIN" ? adminMenus : userMenus;

    return (

        <aside className="app-rail">

            <NavLink
                to={user?.role === "ADMIN" ? "/admin/dashboard" : "/"}
                className="app-rail-brand"
                data-tip="PingMe"
                aria-label="PingMe home"
            >
                <MessageCircle size={22} strokeWidth={2.5}/>
            </NavLink>

            <nav className="app-rail-nav" aria-label="Primary navigation">

                {
                    menus.map(item => (

                        <NavLink

                            key={item.label}

                            to={item.path}

                            className={({ isActive }) =>
                                `app-rail-icon${isActive ? " is-active" : ""}`
                            }

                            data-tip={item.label}

                            aria-label={item.label}

                        >

                            <item.icon size={21}/>

                        </NavLink>

                    ))
                }

            </nav>

            <div className="app-rail-utility">

                <span className="app-rail-slot" data-tip="Theme">
                    <ThemeToggle/>
                </span>

                <span className="app-rail-slot" data-tip="Notifications">
                    <NotificationBell align="left"/>
                </span>

                <span className="app-rail-slot app-rail-profile-slot" data-tip="Account">
                    <ProfileDropdown align="left"/>
                </span>

            </div>

        </aside>

    );

}
