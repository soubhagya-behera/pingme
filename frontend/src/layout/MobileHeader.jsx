import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import NotificationBell from "../components/user/notifications/NotificationBell";
import ProfileDropdown from "../components/ui/ProfileDropdown";
import { useAuth } from "../context/AuthContext";

export default function MobileHeader({

    onMenuClick

}){

    const { user } = useAuth();

    const location = useLocation();

    const brandPath = user?.role === "ADMIN" ? "/admin/dashboard" : "/";

    return (

        <header className="mobile-header">

            <div className="mobile-header-left">

                <button
                    type="button"
                    className="mobile-header-menu"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                >
                    <Menu size={22}/>
                </button>

                {
                    location.pathname !== brandPath
                        ?
                        (
                            <Link to={brandPath} className="mobile-header-brand">
                                PingMe
                            </Link>
                        )
                        :
                        (
                            <span className="mobile-header-brand">
                                PingMe
                            </span>
                        )
                }

            </div>

            <div className="mobile-header-actions">

                <NotificationBell/>

                <ProfileDropdown/>

            </div>

        </header>

    );

}
