import Card from "../../ui/Card";
import {
    MessageCircle,
    ChevronRight
} from "lucide-react";

export default function RecentChats({ chats }) {

    return (

        <Card className="recent-chat-card">

            <div className="recent-chat-header">

                <div>

                    <h2>

                        Recent Chats

                    </h2>

                    <p>

                        Continue your latest conversations

                    </p>

                </div>

                <button className="recent-chat-view-all">

                    View All

                    <ChevronRight size={16}/>

                </button>

            </div>

            {

                chats.length === 0 ?

                (

                    <div className="recent-chat-empty">

                        <MessageCircle size={42}/>

                        <h3>

                            No conversations yet

                        </h3>

                        <p>

                            Start chatting with your friends.

                        </p>

                    </div>

                )

                :

                chats.map(chat => (

                    <div

                        key={chat.id}

                        className="recent-chat-item"

                    >

                        <div className="recent-avatar-wrapper">

                            <div className="recent-avatar">

                                {chat.fullName.charAt(0)}

                            </div>

                            {

                                chat.online &&

                                <span className="recent-online"/>

                            }

                        </div>

                        <div className="recent-chat-body">

                            <div className="recent-chat-top">

                                <h3>

                                    {chat.fullName}

                                </h3>

                                <span>

                                    {

                                        chat.lastMessageTime ?

                                        new Date(chat.lastMessageTime)

                                        .toLocaleTimeString([],{

                                            hour:"2-digit",

                                            minute:"2-digit"

                                        })

                                        :

                                        ""

                                    }

                                </span>

                            </div>

                            <p>

                                {chat.lastMessage}

                            </p>

                        </div>

                    </div>

                ))

            }

        </Card>

    );

}