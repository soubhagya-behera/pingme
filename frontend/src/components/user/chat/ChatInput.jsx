import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import {
    Image as ImageIcon,
    Reply,
    Send,
    Smile,
    X
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

import ChatService from "../../../services/ChatService";
import { sendTyping, sendStopTyping } from "../../../websocket/publisher";

export default function ChatInput({
    friend,
    replyingTo,
    clearReply,
    editingMessage,
    clearEditing,
    onMessageSent,
    onImageSelected
}) {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const pickerRef = useRef(null);

    const typingRef = useRef(false);
    const typingTimeout = useRef(null);

    useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.content ?? "");

            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [editingMessage]);

    useEffect(() => {
        const close = e => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(e.target)
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", close);

        return () => {
            document.removeEventListener("mousedown", close);
        };
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(typingTimeout.current);
        };
    }, []);

    function stopTyping() {
        if (!typingRef.current || !friend) return;

        typingRef.current = false;
        sendStopTyping(friend.id);
    }

    function handleTyping(value) {
        setMessage(value);

        if (!friend) return;

        if (!typingRef.current) {
            typingRef.current = true;
            sendTyping(friend.id);
        }

        clearTimeout(typingTimeout.current);

        typingTimeout.current = setTimeout(stopTyping, 1500);
    }

    function chooseImage(e) {
        const file = e.target.files?.[0];

        if (!file) return;

        onImageSelected?.(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function send() {
        if (!friend || !message.trim()) return;

        if (editingMessage) {
            try {
                await ChatService.editMessage(
                    editingMessage.id,
                    message
                );

                toast.success("Message edited");

                clearEditing?.();

                setMessage("");

            } catch (err) {
                console.error(err);
                toast.error("Couldn't edit message.");
            }

            return;
        }

        const payload = {
            clientId: uuid(),
            receiverId: friend.id,
            content: message.trim(),
            messageType: "TEXT",
            replyToId: replyingTo?.id
        };

        setMessage("");

        stopTyping();

        try {
            await ChatService.sendMessage(payload);

            onMessageSent?.({
                id: payload.clientId,
                ...payload,
                senderId: Number(localStorage.getItem("userId")),
                status: "SENDING",
                sentAt: new Date().toISOString()
            });

            clearReply?.();

        } catch (err) {
            console.error(err);

            setMessage(payload.content);

            toast.error("Message failed to send.");
        }
    }

    return (
        <div className="chat-input-area">

            {editingMessage && (
                <div className="chat-input-context is-editing">

                    <span>
                        Editing message
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            clearEditing?.();
                            setMessage("");
                        }}
                    >
                        <X size={18}/>
                    </button>

                </div>
            )}

            {replyingTo && (
                <div className="chat-input-context">

                    <span>
                        <Reply size={16}/>
                        Replying to{" "}
                        {
                            replyingTo.content ||
                            (
                                replyingTo.imageUrl
                                    ? "a photo"
                                    : "a message"
                            )
                        }
                    </span>

                    <button
                        type="button"
                        onClick={clearReply}
                    >
                        <X size={18}/>
                    </button>

                </div>
            )}

            {showEmojiPicker && (
                <div
                    ref={pickerRef}
                    className="chat-emoji-picker"
                >
                    <EmojiPicker
                        width={320}
                        height={380}
                        onEmojiClick={({ emoji }) =>
                            handleTyping(message + emoji)
                        }
                    />
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={chooseImage}
            />

            <div className="chat-input-row">

                <button
                    type="button"
                    className="chat-input-icon-button"
                    onClick={() =>
                        setShowEmojiPicker(v => !v)
                    }
                >
                    <Smile size={20}/>
                </button>

                <button
                    type="button"
                    className="chat-input-icon-button"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                >
                    <ImageIcon size={20}/>
                </button>

                <input
                    ref={inputRef}
                    className="chat-message-field"
                    value={message}
                    placeholder="Type a message..."
                    onChange={e =>
                        handleTyping(e.target.value)
                    }
                    onKeyDown={e => {
                        if (
                            e.key === "Enter" &&
                            !e.shiftKey
                        ) {
                            e.preventDefault();
                            send();
                        }
                    }}
                />

                <button
                    type="button"
                    className="chat-send-button"
                    disabled={!message.trim()}
                    onClick={send}
                >
                    <Send size={18}/>
                </button>

            </div>

        </div>
    );
}