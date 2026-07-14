import Card from "../ui/Card";
import { Clock3, UserPlus, CheckCircle2 } from "lucide-react";

export default function RequestStats({ stats }) {

    const cards = [

        {
            title: "Pending",
            value: stats.pending,
            icon: <Clock3 size={24} />,
        },

        {
            title: "Today",
            value: stats.today,
            icon: <UserPlus size={24} />,
        },

        {
            title: "Accepted",
            value: stats.accepted,
            icon: <CheckCircle2 size={24} />,
        },

    ];

    return (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            {

                cards.map(card => (

                    <Card
                        key={card.title}
                        hover
                        className="p-6 flex items-center justify-between"
                    >

                        <div>

                            <p className="text-sm text-[var(--text-secondary)]">

                                {card.title}

                            </p>

                            <h2 className="text-3xl font-bold mt-2">

                                {card.value}

                            </h2>

                        </div>

                        <div className="text-[var(--primary)]">

                            {card.icon}

                        </div>

                    </Card>

                ))

            }

        </div>

    );

}