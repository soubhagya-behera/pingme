import { Reply } from "lucide-react";

export default function MessageBubble({
    message,
    mine,
    text,
    time,
    status,
    onReply
}) {
    function getStatus() {
        if (!mine) return null;
        if (status === "SENDING") {
            return (
                <span className="text-slate-300">
                    ⏳
                </span>
            );
        }
        if (status === "SENT") {
            return "✓";
        }
        if (status === "DELIVERED") {
            return "✓✓";
        }
        if (status === "READ") {
            return (
                <span className="text-sky-300">
                    ✓✓
                </span>
            );
        }
        return null;
    }

    const showReply = () => {
        if (onReply) {
            onReply(message);
        }
    };

    return (
        <div
            className={`
                flex 
                ${mine ? "justify-end" : "justify-start"} 
                group
            `}
        >
            {/* Reply button for incoming messages */}
            {!mine && (
                <button
                    onClick={showReply}
                    className="
                        opacity-0
                        group-hover:opacity-100
                        transition
                        mr-2
                        self-center
                        text-slate-500
                        hover:text-indigo-600
                    "
                >
                    <Reply size={18} />
                </button>
            )}

            <div
                className={`
                    max-w-[70%]
                    rounded-3xl
                    px-4
                    py-2.5
                    ${mine
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-black"
                    }
                `}
            >
                <>
                    {message.reply && (
                        <div
                            className={`
                                mb-2
                                rounded-xl
                                px-3
                                py-2
                                border-l-4
                                ${
                                    mine
                                        ? "bg-indigo-500 border-indigo-200"
                                        : "bg-slate-300 border-indigo-500"
                                }
                            `}
                        >
                            <div
                                className={`
                                    text-xs
                                    font-semibold
                                    ${
                                        mine
                                            ? "text-indigo-100"
                                            : "text-indigo-700"
                                    }
                                `}
                            >
                                Reply
                            </div>
                            <div
                                className={`
                                    text-sm
                                    truncate
                                    ${
                                        mine
                                            ? "text-indigo-50"
                                            : "text-slate-700"
                                    }
                                `}
                            >
                                {message.reply.content}
                            </div>
                        </div>
                    )}

                    <div>
                        {text}
                    </div>
                </>

                <div
                    className={`
                        mt-2
                        flex
                        justify-end
                        items-center
                        gap-1
                        text-xs
                        ${mine
                            ? "text-indigo-100"
                            : "text-slate-500"
                        }
                    `}
                >
                    {
                        time ?
                        new Date(time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                        :
                        ""
                    }
                    {
                        getStatus()
                    }
                </div>
            </div>

            {/* Reply button for outgoing messages */}
            {mine && (
                <button
                    onClick={showReply}
                    className="
                        opacity-0
                        group-hover:opacity-100
                        transition
                        ml-2
                        self-center
                        text-slate-500
                        hover:text-indigo-600
                    "
                >
                    <Reply size={18} />
                </button>
            )}
        </div>
    );
}