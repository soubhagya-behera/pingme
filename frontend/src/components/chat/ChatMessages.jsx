import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { useAuth } from "../../context/AuthContext";

export default function ChatMessages({ messages }) {

    const { user } = useAuth();

    const bottomRef = useRef(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages]);

    return (

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {

                messages.length === 0 ?

                (

                    <div className="text-center text-slate-400 mt-20">

                        No messages yet

                    </div>

                )

                :

                messages.map(message => (

                    <MessageBubble

    key={message.id}

    mine={message.senderId===user.id}

    text={message.content}

    time={message.sentAt}

    status={message.status}

/>

                ))

            }

            <div ref={bottomRef}></div>

        </div>

    );

}