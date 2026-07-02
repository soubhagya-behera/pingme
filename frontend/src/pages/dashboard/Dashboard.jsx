import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsCards from "../../components/dashboard/StatsCards";
import RecentChats from "../../components/dashboard/RecentChats";
import PendingRequests from "../../components/dashboard/PendingRequests";

export default function Dashboard(){

    return(

        <>

            <DashboardHeader/>

            <StatsCards/>

            <RecentChats/>

            <PendingRequests/>

        </>

    );

}