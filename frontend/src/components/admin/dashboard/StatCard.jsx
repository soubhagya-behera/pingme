import Card from "../../ui/Card";

export default function StatCard({

    title,

    value,

    icon: Icon,

    color = "text-indigo-600"

}) {

    return (

        <Card className="p-6">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm text-[var(--text-secondary)]">

                        {title}

                    </p>

                    <h2 className="mt-3 text-4xl font-bold">

                        {value}

                    </h2>

                </div>

                <div className={color}>

                    <Icon size={30} />

                </div>

            </div>

        </Card>

    );

}