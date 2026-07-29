import { useAuth } from "../../../context/AuthContext";
import {
    CalendarDays,
    Activity
} from "lucide-react";

export default function DashboardHeader() {

    const { user } = useAuth();

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";

    const today = new Date();

    const date = today.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    return (

        <div className="dashboard-header">

            <div>

                <span className="dashboard-greeting">

                    {greeting} ☀️

                </span>

                <h1 className="dashboard-title">

                    Welcome back,

                    <span>

                        {" "}
                        {user?.name?.split(" ")[0]} 👋

                    </span>

                </h1>

                <p className="dashboard-subtitle">

                    Here's what's happening with your PingMe account today.

                </p>

            </div>

            <div className="dashboard-status-card">

                <div className="dashboard-status-item">

                    <CalendarDays size={18} />

                    <div>

                        <h4>{date}</h4>

                        <span>Today</span>

                    </div>

                </div>

                <div className="dashboard-status-item">

                    <Activity size={18} />

                    <div>

                        <h4>

                            <span className="live-dot"></span>

                            Connected

                        </h4>

                        <span>

                            Last Sync • Just now

                        </span>

                    </div>

                </div>

            </div>

        </div>

    );

}