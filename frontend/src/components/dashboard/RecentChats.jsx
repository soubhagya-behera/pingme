import Card from "../ui/Card";

export default function RecentChats({

    chats

}) {

    return (

        <Card className="mt-8 p-6">

            <h2 className="text-2xl font-bold mb-5">

                Recent Chats

            </h2>

            {

                chats.length === 0 ?

                    (

                        <p className="text-slate-400">

                            No recent chats.

                        </p>

                    )

                    :

                    chats.map(chat => (

                        <div

                            key={chat.id}

                            className="flex justify-between items-center py-3 border-b last:border-0"

                        >

                            <div>

                                <h3 className="font-semibold">

                                    {chat.fullName}

                                </h3>

                                <p className="text-sm text-slate-500">

                                    {chat.lastMessage}

                                </p>

                            </div>

                            <div className="text-right">

                                <div

                                    className={`w-3 h-3 rounded-full ml-auto ${
                                        chat.online
                                            ? "bg-green-500"
                                            : "bg-slate-300"
                                    }`}
                                />

                                <p className="text-xs text-slate-400 mt-2">

                                    {

                                        chat.lastMessageTime ?

                                            new Date(chat.lastMessageTime)

                                                .toLocaleTimeString([], {

                                                    hour: "2-digit",

                                                    minute: "2-digit"

                                                })

                                            : ""

                                    }

                                </p>

                            </div>

                        </div>

                    ))

            }

        </Card>

    );

}