import { useEffect, useState } from "react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsCards from "../../components/dashboard/StatsCards";
import RecentChats from "../../components/dashboard/RecentChats";
import PendingRequests from "../../components/dashboard/PendingRequests";

import DashboardService from "../../services/DashboardService";

export default function Dashboard() {

    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {

        loadDashboard();

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