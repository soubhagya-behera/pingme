import { useEffect, useState } from "react";
import { Users, Clock3, CheckCircle2, Wifi } from "lucide-react";
import Card from "../../components/ui/Card";
import AdminService from "../../services/AdminService";

export default function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const response = await AdminService.getDashboardStats();
            setStats(response.data.data);
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
            <div>
                <p className="text-sm font-semibold text-indigo-600 uppercase">
                    Admin Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-bold">
                    Welcome Administrator 👋
                </h1>
                <p className="text-[var(--text-secondary)] mt-2">
                    Monitor PingMe from one place.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((item) => (
                    <Card key={item.title} className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {item.title}
                                </p>
                                <h2 className="mt-4 text-4xl font-bold">
                                    {item.value}
                                </h2>
                            </div>
                            <item.icon
                                className="text-indigo-600"
                                size={30}
                            />
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-8">
                Recent Activity Coming Soon...
            </Card>
        </div>
    );
}