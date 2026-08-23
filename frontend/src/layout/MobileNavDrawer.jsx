import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { userMenus, adminMenus } from "./navigation";

export default function MobileNavDrawer({

    open,

    onClose

}){

    const { user } = useAuth();

    if(!open){

        return null;

    }

    const menus = user?.role === "ADMIN" ? adminMenus : userMenus;

    return (

        <div className="mobile-nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">

            <button
                type="button"
                className="mobile-nav-backdrop"
                onClick={onClose}
                aria-label="Close navigation menu"
            />

            <div className="mobile-nav-panel">

                <div className="mobile-nav-head">

                    <span className="mobile-nav-brand">PingMe</span>

                    <button
                        type="button"
                        className="mobile-nav-close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <X size={20}/>
                    </button>

                </div>

                <nav className="mobile-nav-list" aria-label="Primary navigation">

                    {
                        menus.map(item => (

                            <NavLink

                                key={item.label}

                                to={item.path}

                                onClick={onClose}

                                className={({ isActive }) =>
                                    `mobile-nav-item${isActive ? " is-active" : ""}`
                                }

                            >

                                <item.icon size={20}/>

                                <span>{item.label}</span>

                            </NavLink>

                        ))
                    }

                </nav>

                <div className="mobile-nav-footer">

                    <span>Theme</span>

                    <ThemeToggle/>

                </div>

            </div>

        </div>

    );

}
