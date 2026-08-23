import { useEffect, useState } from "react";

import DashboardHeader from "../../../components/user/dashboard/DashboardHeader";
import StatsCards from "../../../components/user/dashboard/StatsCards";
import RecentChats from "../../../components/user/dashboard/RecentChats";
import PendingRequests from "../../../components/user/dashboard/PendingRequests";
import QuickActions from "../../../components/user/dashboard/QuickActions";

import DashboardService from "../../../services/DashboardService";

import Button from "../../../components/ui/Button";

import "../../../styles/user/dashboard/dashboard-header.css";
import "../../../styles/user/dashboard/stats-cards.css";
import "../../../styles/user/dashboard/recent-chats.css";
import "../../../styles/user/dashboard/pending-requests.css";
import "../../../styles/user/dashboard/quick-actions.css";
import "../../../styles/user/dashboard/dashboard-layout.css";

import {
    subscribeDashboard,
    subscribeFriendRequests
} from "../../../websocket/subscriptions";
import { whenSocketConnected } from "../../../websocket/socket";

export default function Dashboard() {

    const [dashboard, setDashboard] = useState(null);

    const [error, setError] = useState(null);

    useEffect(() => {

    loadDashboard();

    let dashboardSubscription;

    let friendRequestSubscription;

    whenSocketConnected(() => {

    dashboardSubscription = subscribeDashboard(async () => {

        console.log("Dashboard Update");

        await loadDashboard();

    });

    friendRequestSubscription = subscribeFriendRequests(async () => {

        console.log("Friend Request Update");

        await loadDashboard();

    });

});

    return () => {

        dashboardSubscription?.unsubscribe();

        friendRequestSubscription?.unsubscribe();

    };

}, []);

    async function loadDashboard() {

        setError(null);

        try {

            const response =
                await DashboardService.getDashboard();

            setDashboard(response.data.data);

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                    "Unable to load your dashboard. Please check your connection and try again."
            );

        }

    }

    if (!dashboard) {

        if (error) {

            return (

                <div className="flex flex-col justify-center items-center h-96 gap-4">

                    <p className="text-red-500 text-sm">{error}</p>

                    <Button onClick={loadDashboard}>
                        Retry
                    </Button>

                </div>

            );

        }

        return (

            <div className="flex justify-center items-center h-96">

                Loading Dashboard...

            </div>

        );

    }

    return (

        <>

            <DashboardHeader />

<StatsCards stats={dashboard.stats} />

<div className="dashboard-content-grid">

    <QuickActions />

    <RecentChats chats={dashboard.recentChats} />

    <PendingRequests requests={dashboard.pendingRequests} />

</div>

        </>

    );

}
