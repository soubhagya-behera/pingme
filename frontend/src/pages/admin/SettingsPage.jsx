import { useEffect, useState } from "react";

import AdminService from "../../services/AdminService";

import AdminProfileCard from "../../components/admin/settings/AdminProfileCard";
import SecurityCard from "../../components/admin/settings/SecurityCard";
import SystemInformationCard from "../../components/admin/settings/SystemInformationCard";
import DatabaseStatisticsCard from "../../components/admin/settings/DatabaseStatisticsCard";
import AboutPingMeCard from "../../components/admin/settings/AboutPingMeCard";

export default function SettingsPage() {

    const [settings, setSettings] = useState(null);

    useEffect(() => {

        loadSettings();

    }, []);

    async function loadSettings() {

        try {

            const response =
                await AdminService.getSettings();

            setSettings(response.data.data);

        }

        catch (error) {

            console.log(error);

        }

    }

    if (!settings) {

        return (

            <div className="p-8">

                Loading...

            </div>

        );

    }

    return (

        <div className="space-y-8">

            <h1 className="text-3xl font-bold">

                Settings

            </h1>

            <div className="grid gap-6 lg:grid-cols-2">

    <AdminProfileCard
        settings={settings}
    />

    <SecurityCard
        settings={settings}
    />

</div>
<div className="grid gap-6 lg:grid-cols-2">

    <SystemInformationCard
        settings={settings}
    />

    <DatabaseStatisticsCard
        settings={settings}
    />

    <AboutPingMeCard
        settings={settings}
    />

</div>

        </div>

    );

}