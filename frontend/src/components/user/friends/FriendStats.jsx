import {
    Users,
    Wifi,
    WifiOff
} from "lucide-react";

export default function FriendStats({ stats }) {

    const cards = [

        {
            title: "Friends",
            value: stats.totalFriends,
            icon: <Users size={26} />
        },

        {
            title: "Online",
            value: stats.onlineFriends,
            icon: <Wifi size={26} />
        },

        {
            title: "Offline",
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

                            <p>

                                {card.title}

                            </p>

                        </div>

                    </div>

                ))

            }

        </div>

    );

}