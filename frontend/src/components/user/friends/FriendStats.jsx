import {
    Users,
    Wifi,
    WifiOff
} from "lucide-react";

export default function FriendStats({ stats }) {

    const cards = [

        {
            title: "Friends",
            subtitle:"Connected people",
            value: stats.totalFriends,
            icon: <Users size={26} />
        },

        {
            title: "Online",
            subtitle:"Available now",
            value: stats.onlineFriends,
            icon: <Wifi size={26} />
        },

        {
            title: "Offline",
            subtitle:"Away currently",
            value: stats.offlineFriends,
            icon: <WifiOff size={26} />
        }

    ];

    return (

        <div className="friend-stats">

            {

                cards.map(card => (

                    <div
                        key={card.title}
                        className="friend-stat-card"
                    >

                        <div className="friend-stat-icon">

                            {card.icon}

                        </div>

                        <div>

                            <h2>

                                {card.value}

                            </h2>

                            <div className="friend-stat-copy">

    <p>

        {card.title}

    </p>

    <span>

        {card.subtitle}

    </span>

</div>

                        </div>

                    </div>

                ))

            }

        </div>

    );

}