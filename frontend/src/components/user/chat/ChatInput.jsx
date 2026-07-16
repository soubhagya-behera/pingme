import { useState, useRef } from "react";
import { v4 as uuid } from "uuid";
import { Send } from "lucide-react";
import { sendChatMessage, sendTyping, sendStopTyping } from "../../../websocket/publisher";

export default function ChatInput({

    friend,

    onMessageSent

}){

    const [message, setMessage] = useState("");
    const typingRef = useRef(false);
    const typingTimeout = useRef(null);

    function handleTyping(value){

    setMessage(value);

    if(!friend) return;

    // First key pressed
    if(!typingRef.current){

        typingRef.current = true;

        sendTyping(friend.id);

    }

    // Reset timer
    if(typingTimeout.current){

        clearTimeout(

            typingTimeout.current

        );

    }

    typingTimeout.current = setTimeout(()=>{

        typingRef.current = false;

        sendStopTyping(friend.id);

    },1500);

}

    function send() {

    if (!friend) return;

    if (message.trim() === "") return;

    const clientId = uuid();

    const tempMessage = {

        id: clientId,

        clientId,

        senderId: Number(localStorage.getItem("userId")),

        receiverId: friend.id,

        content: message,

        status: "SENDING",

        sentAt: new Date()

    };

    // ⭐ Show instantly
    onMessageSent(tempMessage);

    if(typingRef.current){

    typingRef.current = false;

    clearTimeout(

        typingTimeout.current

    );

    sendStopTyping(

        friend.id

    );

}

    sendChatMessage({

        clientId,

        receiverId: friend.id,

        content: message

    });

    setMessage("");

}

    return (

        <div className="border-t bg-white px-5 py-4 flex items-center gap-3">

            <input

                value={message}

                onChange={(e) => handleTyping(e.target.value)}

                placeholder="Type a message..."

                className="flex-1 rounded-full border border-slate-300 px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-300"

                onKeyDown={(e) => {

                    if (e.key === "Enter") {

                        send();

                    }

                }}

            />

            <button

                onClick={send}

                className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-600 text-white px-5"

            >

                <Send size={18}/>

            </button>

        </div>

    );

}