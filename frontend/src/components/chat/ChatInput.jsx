import { useState } from "react";
import { Send } from "lucide-react";
import { sendChatMessage } from "../../websocket/publisher";

export default function ChatInput({

    friend

}) {

    const [message, setMessage] = useState("");

    function send() {

        if (!friend) return;

        if (message.trim() === "") return;

        try {

            const text = message;

setMessage("");

sendChatMessage({

    receiverId: friend.id,

    content: text

});



        } catch (error) {

            console.log(error);

        }

    }

    return (

        <div className="border-t p-5 flex gap-3">

            <input

                value={message}

                onChange={(e) => setMessage(e.target.value)}

                placeholder="Type a message..."

                className="flex-1 rounded-xl border px-4 py-3 outline-none"

                onKeyDown={(e) => {

                    if (e.key === "Enter") {

                        send();

                    }

                }}

            />

            <button

                onClick={send}

                className="rounded-xl bg-indigo-600 text-white px-5"

            >

                <Send size={18}/>

            </button>

        </div>

    );

}