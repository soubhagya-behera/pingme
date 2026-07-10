import { useEffect, useState } from "react";
import { Users, Clock3, CheckCircle2, Wifi } from "lucide-react";
import Card from "../../components/ui/Card";
import AdminHeader from "../../components/admin/dashboard/AdminHeader";
import StatCard from "../../components/admin/dashboard/StatCard";
import AdminService from "../../services/AdminService";
import QuickActions from "../../components/admin/dashboard/QuickActions";
import RecentUsers from "../../components/admin/dashboard/RecentUsers";

export default function AdminOverview() {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const [statsResponse, usersResponse] = await Promise.all([
    AdminService.getDashboardStats(),
    AdminService.getUsers({
        page: 0,
        size: 5
    })
]);

setStats(statsResponse.data.data);

setRecentUsers(usersResponse.data.data.users);
        } catch (error) {
            console.log(error);
        }
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers ?? 0,
            icon: Users
        },
        {
            title: "Pending Users",
            value: stats?.pendingUsers ?? 0,
            icon: Clock3
        },
        {
            title: "Approved Users",
            value: stats?.approvedUsers ?? 0,
            icon: CheckCircle2
        },
        {
            title: "Online Users",
            value: stats?.onlineUsers ?? 0,
            icon: Wifi
        }
    ];

    return (
        <div className="space-y-8">

            <AdminHeader />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((item) => (

    <StatCard
        key={item.title}
        title={item.title}
        value={item.value}
        icon={item.icon}
    />

))}
            </div>
            <QuickActions />

            <RecentUsers
    users={recentUsers}
/>
        </div>
    );
}