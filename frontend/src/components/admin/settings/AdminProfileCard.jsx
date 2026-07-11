import Card from "../../ui/Card";
import Button from "../../ui/Button";

export default function AdminProfileCard({ settings }) {

    return (

        <Card className="p-6">

            <div className="flex items-center gap-4">

                <div
                    className="
                    h-16
                    w-16
                    rounded-full
                    bg-indigo-600
                    flex
                    items-center
                    justify-center
                    text-white
                    text-2xl
                    font-bold
                    "
                >
                    {settings.adminName?.charAt(0)}
                </div>

                <div>

                    <h2 className="text-xl font-bold">

                        {settings.adminName}

                    </h2>

                    <p className="text-[var(--text-secondary)]">

                        {settings.adminEmail}

                    </p>

                    <span
                        className="
                        inline-block
                        mt-2
                        rounded-full
                        bg-indigo-100
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-indigo-700
                        "
                    >
                        {settings.role}
                    </span>

                </div>

            </div>

        </Card>

    );

}