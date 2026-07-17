import { useState, useRef, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Send, Smile, X, Reply } from "lucide-react";
import { sendChatMessage, sendTyping, sendStopTyping } from "../../../websocket/publisher";
import EmojiPicker from "emoji-picker-react";

export default function ChatInput({
    friend,
    replyingTo,
    clearReply,
    onMessageSent
}) {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const inputRef = useRef(null);
    const pickerRef = useRef(null);
    const typingRef = useRef(false);
    const typingTimeout = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleTyping(value) {
        setMessage(value);
        if (!friend) return;
        // First key pressed
        if (!typingRef.current) {
            typingRef.current = true;
            sendTyping(friend.id);
        }
        // Reset timer
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(() => {
            typingRef.current = false;
            sendStopTyping(friend.id);
        }, 1500);
    }

    function onEmojiClick(emojiData) {
        const emoji = emojiData.emoji;
        const input = inputRef.current;
        if (!input) {
            setMessage(prev => prev + emoji);
            return;
        }
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = message;
        const updated =
            text.substring(0, start)
            +
            emoji
            +
            text.substring(end);
        handleTyping(updated);
        requestAnimationFrame(() => {
            input.focus();
            const cursor =
                start +
                emoji.length;
            input.setSelectionRange(
                cursor,
                cursor
            );
        });
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

        if (typingRef.current) {
            typingRef.current = false;
            clearTimeout(typingTimeout.current);
            sendStopTyping(friend.id);
        }

        sendChatMessage({
            clientId,
            receiverId: friend.id,
            content: message,
            replyToId: replyingTo?.id
        });

        setMessage("");
        clearReply?.();
    }

    return (
        <div className="relative border-t bg-white px-5 py-4">
            {replyingTo && (
                <div className="mb-3 rounded-xl border bg-slate-100 px-4 py-3 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                            <Reply size={16} /> Replying to
                        </div>
                        <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                            {replyingTo.content}
                        </div>
                    </div>
                    <button
                        onClick={clearReply}
                        className="text-slate-500 hover:text-red-500"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {showEmojiPicker && (
                <div
                    ref={pickerRef}
                    className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl overflow-hidden"
                >
                    <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width={340}
                        height={420}
                    />
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Emoji Button */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(previous => !previous)}
                    className="text-slate-500 hover:text-indigo-600 transition"
                >
                    <Smile size={24} />
                </button>
                {/* Input */}
                <input
                    ref={inputRef}
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
                {/* Send */}
                <button
                    onClick={send}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-600 text-white"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}