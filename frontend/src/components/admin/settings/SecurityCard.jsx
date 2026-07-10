import Card from "../../ui/Card";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export default function SecurityCard({ settings }) {

    const items = [

        {
            title: "JWT Authentication",
            enabled: settings.jwtEnabled
        },

        {
            title: "Admin Approval",
            enabled: settings.adminApprovalEnabled
        },

        {
            title: "Email Verification",
            enabled: settings.emailVerificationEnabled
        },

        {
            title: "HTTPS",
            enabled: settings.httpsEnabled
        }

    ];

    return (

        <Card className="p-6">

            <div className="flex items-center gap-3 mb-6">

                <ShieldCheck
                    size={26}
                    className="text-indigo-600"
                />

                <h2 className="text-xl font-bold">

                    Security

                </h2>

            </div>

            <div className="space-y-4">

                {items.map(item => (

                    <div
                        key={item.title}
                        className="flex items-center justify-between"
                    >

                        <span>

                            {item.title}

                        </span>

                        <span
                            className={
                                item.enabled
                                    ? "flex items-center gap-2 text-green-600 font-medium"
                                    : "flex items-center gap-2 text-red-600 font-medium"
                            }
                        >

                            {item.enabled
                                ? <CheckCircle2 size={18}/>
                                : <XCircle size={18}/>
                            }

                            {item.enabled
                                ? "Enabled"
                                : "Disabled"
                            }

                        </span>

                    </div>

                ))}

            </div>

        </Card>

    );

}