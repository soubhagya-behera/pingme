import Card from "../../ui/Card";
import { Server } from "lucide-react";

export default function SystemInformationCard({ settings }) {

    const items = [

        {
            title: "Application",
            value: settings.applicationName
        },

        {
            title: "Version",
            value: settings.applicationVersion
        },

        {
            title: "Java",
            value: settings.javaVersion
        },

        {
            title: "Spring Boot",
            value: settings.springBootVersion
        },

        {
            title: "Database",
            value: settings.database
        },

        {
            title: "Server Time",
            value: new Date(settings.serverTime).toLocaleString()
        }

    ];

    return (

        <Card className="p-6">

            <div className="flex items-center gap-3 mb-6">

                <Server
                    size={26}
                    className="text-indigo-600"
                />

                <h2 className="text-xl font-bold">

                    System Information

                </h2>

            </div>

            <div className="space-y-4">

                {items.map(item => (

                    <div
                        key={item.title}
                        className="flex justify-between items-center"
                    >

                        <span className="text-[var(--text-secondary)]">

                            {item.title}

                        </span>

                        <span className="font-semibold">

                            {item.value}

                        </span>

                    </div>

                ))}

            </div>

        </Card>

    );

}