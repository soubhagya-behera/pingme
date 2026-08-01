import Card from "../../ui/Card";
import {
    Clock3,
    UserPlus,
    Send
} from "lucide-react";

export default function RequestStats({
    stats
}) {
    const cards = [
        {
            title: "Pending",
            subtitle: "Waiting for action",
            value: stats.pending,
            icon: <Clock3 size={30}/>
        },
        {
            title: "Today",
            subtitle: "Received today",
            value: stats.today,
            icon: <UserPlus size={30}/>
        },
        {
            title: "Sent",
            subtitle: "Outgoing requests",
            value: stats.sent,
            icon: <Send size={30}/>
        }
    ];

    return (
        <div className="grid gap-5 md:grid-cols-3 mb-8">
            {
                cards.map(card => (
                    <Card
                        key={card.title}
                        hover
                        className="p-6 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-[var(--text-secondary)]">
                                {card.title}
                            </p>
                            <h2 className="text-3xl font-bold mt-2">
                                {card.value}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                {card.subtitle}
                            </p>
                        </div>
                        <div className="text-indigo-600">
                            {card.icon}
                        </div>
                    </Card>
                ))
            }
        </div>
    );
}