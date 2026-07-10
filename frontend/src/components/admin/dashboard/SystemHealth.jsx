import Card from "../../ui/Card";
import {
    Database,
    Server,
    Mail,
    HardDrive
} from "lucide-react";

const services = [
    {
        title: "Database",
        status: "Online",
        icon: Database,
        color: "text-green-600"
    },
    {
        title: "API Server",
        status: "Running",
        icon: Server,
        color: "text-green-600"
    },
    {
        title: "Mail Service",
        status: "Connected",
        icon: Mail,
        color: "text-green-600"
    },
    {
        title: "Storage",
        status: "Healthy",
        icon: HardDrive,
        color: "text-green-600"
    }
];

export default function SystemHealth() {

    return (

        <Card className="p-6">

            <h2 className="text-xl font-semibold mb-5">
                System Health
            </h2>

            <div className="space-y-4">

                {services.map(service => (

                    <div
                        key={service.title}
                        className="flex items-center justify-between"
                    >

                        <div className="flex items-center gap-3">

                            <service.icon
                                className={service.color}
                                size={22}
                            />

                            <span>
                                {service.title}
                            </span>

                        </div>

                        <span
                            className="
                            rounded-full
                            bg-green-100
                            text-green-700
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            "
                        >
                            {service.status}
                        </span>

                    </div>

                ))}

            </div>

        </Card>

    );

}