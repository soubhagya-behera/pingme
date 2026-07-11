import Card from "../../ui/Card";
import { Info } from "lucide-react";

export default function AboutPingMeCard({ settings }) {

    return (

        <Card className="p-6">

            <div className="flex items-center gap-3 mb-6">

                <Info
                    size={26}
                    className="text-indigo-600"
                />

                <h2 className="text-xl font-bold">

                    About PingMe

                </h2>

            </div>

            <div className="space-y-5">

                <InfoRow
                    label="Application"
                    value={settings.applicationName}
                />

                <InfoRow
                    label="Version"
                    value={settings.applicationVersion}
                />

                <InfoRow
                    label="Developer"
                    value={settings.developer}
                />

                <InfoRow
                    label="Framework"
                    value={settings.framework}
                />

                <InfoRow
                    label="License"
                    value={settings.license}
                />

            </div>

        </Card>

    );

}

function InfoRow({ label, value }) {

    return (

        <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">

            <p className="text-[var(--text-secondary)]">

                {label}

            </p>

            <p className="font-semibold">

                {value}

            </p>

        </div>

    );

}