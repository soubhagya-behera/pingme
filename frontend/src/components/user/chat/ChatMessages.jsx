import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { useAuth } from "../../../context/AuthContext";

export default function ChatMessages({ messages, onReply, onEdit, onDelete, onDeleteMe
 }) {

    const { user } = useAuth();

    const bottomRef = useRef(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages]);

    return (

        <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 px-3 py-4 space-y-3 sm:px-6 sm:py-5">

            {

                messages.length === 0 ?

                (

                    <div className="text-center text-slate-400 mt-20">

                        Start your conversation 👋

                    </div>

                )

                :

                messages.map(message => (

                    <MessageBubble

    key={message.id}

    message={message}

    mine={message.senderId===user.id}

    text={message.content}

    time={message.sentAt}

    status={message.status}

    onReply={onReply}

    onEdit={onEdit}

    onDelete={onDelete}

    onDeleteMe={onDeleteMe}

/>

                ))

            }

            <div ref={bottomRef}></div>

        </div>

    );

}
