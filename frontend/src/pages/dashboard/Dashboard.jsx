import { useEffect, useState } from "react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsCards from "../../components/dashboard/StatsCards";
import RecentChats from "../../components/dashboard/RecentChats";
import PendingRequests from "../../components/dashboard/PendingRequests";

import DashboardService from "../../services/DashboardService";


export default function Dashboard() {

    const [friends, setFriends] = useState([]);

    const [requests, setRequests] = useState([]);

    useEffect(() => {

        loadDashboard();

    }, []);

    async function loadDashboard() {

        try {

            const friendResponse =
                await DashboardService.getFriends();

            const requestResponse =
                await DashboardService.getIncomingRequests();

            setFriends(friendResponse.data.data);

            setRequests(requestResponse.data.data);

        } catch (error) {

            console.log(error);

        }

    }

    return (

        <>

            <DashboardHeader/>

            <StatsCards

                friends={friends.length}

                requests={requests.length}

            />

            <RecentChats/>

            <PendingRequests/>

        </>

    );

}