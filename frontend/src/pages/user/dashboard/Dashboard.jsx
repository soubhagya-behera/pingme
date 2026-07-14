import { useEffect, useState } from "react";

import DashboardHeader from "../../../components/user/dashboard/DashboardHeader";
import StatsCards from "../../../components/user/dashboard/StatsCards";
import RecentChats from "../../../components/user/dashboard/RecentChats";
import PendingRequests from "../../../components/user/dashboard/PendingRequests";

import DashboardService from "../../../services/DashboardService";

import {
    connectSocket,
    disconnectSocket
} from "../../../websocket/socket";

import {
    subscribeDashboard,
    subscribeFriendRequests
} from "../../../websocket/subscriptions";

export default function Dashboard() {

    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {

    loadDashboard();

    let dashboardSubscription;

    let friendRequestSubscription;

    connectSocket(() => {

        dashboardSubscription =

            subscribeDashboard(async () => {

                console.log("Dashboard Update");

                await loadDashboard();

            });

        friendRequestSubscription =

            subscribeFriendRequests(async () => {

                console.log("Friend Request Update");

                await loadDashboard();

            });

    });

    return () => {

        dashboardSubscription?.unsubscribe();

        friendRequestSubscription?.unsubscribe();

        disconnectSocket();

    };

}, []);

    async function loadDashboard() {

        try {

            const response =
                await DashboardService.getDashboard();

            setDashboard(response.data.data);

        } catch (error) {

            console.log(error);

        }

    }

    if (!dashboard) {

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

            <RecentChats chats={dashboard.recentChats} />

            <PendingRequests requests={dashboard.pendingRequests} />

        </>

    );

}