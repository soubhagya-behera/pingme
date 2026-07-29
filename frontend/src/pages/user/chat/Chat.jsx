import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import ChatSidebar from "../../../components/user/chat/ChatSidebar";
import ChatHeader from "../../../components/user/chat/ChatHeader";
import ChatMessages from "../../../components/user/chat/ChatMessages";
import ChatInput from "../../../components/user/chat/ChatInput";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import ChatService from "../../../services/ChatService";
import { acknowledgeRead } from "../../../websocket/publisher";
import { useSocket } from "../../../context/SocketProvider";
import { MessageCircleMore, Plus } from "lucide-react";
import "../../../styles/user/chat/chat.css";
import ImagePreviewModal from "../../../components/user/chat/ImagePreviewModal";
import { v4 as uuid } from "uuid";

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const selectedFriendRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [imageCaption, setImageCaption] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageError, setImageError] = useState("");

    const uploadInFlight = useRef(false);

    // ConfirmDialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [confirmCallback, setConfirmCallback] = useState(null);

    const socket = useSocket();

    const {
        onTyping,
        onMessageEdited,
        onMessageDeleted
    } = socket;

    useEffect(() => { loadChatSidebar(); }, []);
    useEffect(() => { selectedFriendRef.current = selectedFriend; }, [selectedFriend]);
    
    useEffect(() => {
        const unsubscribe = onTyping(event => {
            setTypingUsers(prev => {
                const copy = new Set(prev);
                if (event.typing) {
                    copy.add(event.receiverId);
                } else {
                    copy.delete(event.receiverId);
                }
                return copy;
            });
        });
        return unsubscribe;
    }, [onTyping]);

    useEffect(() => {
        if (!onMessageEdited) return;
        const unsubscribe = onMessageEdited(event => {
            setMessages(previous =>
                previous.map(message =>
                    message.id === event.messageId
                        ? {
                            ...message,
                            content: event.content,
                            edited: event.edited,
                            editedAt: event.editedAt
                        }
                        : message
                )
            );
        });
        return unsubscribe;
    }, [onMessageEdited]);

    useEffect(() => {
        if (!onMessageDeleted) return;
        const unsubscribe = onMessageDeleted(event => {
            setMessages(previous =>
                previous.map(message =>
                    message.id === event.messageId
                        ? {
                            ...message,
                            deletedForEveryone: true,
                            deletedAt: event.deletedAt
                        }
                        : message
                )
            );
        });
        return unsubscribe;
    }, [onMessageDeleted]);

    useEffect(() => {
        if (!socket) return;
        const removeMessage = socket.onMessage(incoming => {
            const myId = Number(localStorage.getItem("userId"));
            const friend = selectedFriendRef.current;
            const isOpenConversation = friend &&
                ((incoming.senderId === friend.id && incoming.receiverId === myId) ||
                 (incoming.senderId === myId && incoming.receiverId === friend.id));

            if (incoming.receiverId === myId && isOpenConversation) acknowledgeRead(incoming.id);

            setMessages(previous => {
                const optimisticIndex = previous.findIndex(item => item.clientId && item.clientId === incoming.clientId);
                if (optimisticIndex !== -1) {
                    const next = [...previous]; next[optimisticIndex] = incoming; return next;
                }
                if (!isOpenConversation || previous.some(item => item.id === incoming.id)) return previous;
                return [...previous, incoming];
            });
        });
        const removeReceipt = socket.onReceipt(receipt =>
            setMessages(previous => previous.map(message =>
                message.id === receipt.messageId ? { ...message, status: receipt.status } : message
            ))
        );
        const removePresence = socket.onPresence(status => {
            setFriends(previous => previous.map(friend => friend.id === status.userId ? { ...friend, online: status.online } : friend));
            setSelectedFriend(previous => !previous || previous.id !== status.userId ? previous : { ...previous, online: status.online });
        });
        return () => { removeMessage(); removeReceipt(); removePresence(); };
    }, [socket]);

    async function loadChatSidebar() {
        try { setFriends((await ChatService.getChatSidebar()).data.data); }
        catch { setFriends([]); }
        finally { setLoading(false); }
    }

    async function selectFriend(friend) {
        setSelectedFriend(friend); setShowChat(true);
        try {
            const history = await ChatService.getHistory(friend.id);
            setMessages(history.data.data);
            await ChatService.markConversationRead(friend.id);
            setMessages(previous => previous.map(message => message.senderId === friend.id ? { ...message, status: "READ" } : message));
        } catch { setMessages([]); }
    }

    function resetImagePreview() {
        setSelectedImage(null);
        setImageCaption("");
        setImageError("");
        setUploadProgress(0);
    }

    async function sendImage() {
        if (
            !selectedImage ||
            !selectedFriend ||
            uploadInFlight.current
        ) {
            return;
        }

        uploadInFlight.current = true;

        setUploadingImage(true);
        setUploadProgress(0);
        setImageError("");

        try {
            let uploadResponse;

            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    uploadResponse = await ChatService.uploadImage(
                        selectedImage,
                        percent => {
                            setUploadProgress(percent);
                        }
                    );
                    break;
                } catch (err) {
                    if (
                        attempt === 1 ||
                        err?.response?.status
                    ) {
                        throw err;
                    }
                }
            }

            const payload = {
                clientId: uuid(),
                receiverId: selectedFriend.id,
                content: imageCaption.trim(),
                imageUrl: uploadResponse.data.data.imageUrl,
                messageType: "IMAGE",
                replyToId: replyingTo?.id
            };

            await ChatService.sendMessage(payload);

            toast.success("Image sent");

setTimeout(() => {

    resetImagePreview();

    setReplyingTo(null);

}, 0);

        } catch (err) {
            console.error(err);
            const errorMessage =
                err?.response?.data?.message ||
                "Image upload failed.";
            setImageError(errorMessage);
            toast.error(errorMessage);
        } finally {
            uploadInFlight.current = false;
            setUploadingImage(false);
        }
    }

    function openConfirm(config, callback) {
        setConfirmConfig(config);
        setConfirmCallback(() => callback);
        setConfirmOpen(true);
    }

    function deleteForEveryone(message) {
        openConfirm(
            {
                title: "Delete Message",
                message: "Delete this message for everyone? This action cannot be undone.",
                confirmText: "Delete",
                cancelText: "Cancel",
                confirmVariant: "danger"
            },
            async () => {
                try {
                    await ChatService.deleteForEveryone(message.id);
                    toast.success("Message deleted for everyone.");
                } catch (error) {
                    console.error(error);
                    toast.error("Couldn't delete the message.");
                }
            }
        );
    }

    function deleteForMe(message) {
        openConfirm(
            {
                title: "Delete Message",
                message: "Delete this message only for you?",
                confirmText: "Delete",
                cancelText: "Cancel",
                confirmVariant: "danger"
            },
            async () => {
                try {
                    await ChatService.deleteForMe(message.id);
                    toast.success("Message deleted.");
                    setMessages(previous =>
                        previous.filter(
                            item => item.id !== message.id
                        )
                    );
                } catch (error) {
                    console.error(error);
                    toast.error("Couldn't delete the message.");
                }
            }
        );
    }

    if (loading) return <div className="flex justify-center items-center h-full">Loading chats...</div>;

    return (
        <div className="chat-workspace">
            <div className={`chat-sidebar-pane ${showChat ? "chat-pane-hidden-mobile" : ""}`}>
                <ChatSidebar friends={friends} selectedFriend={selectedFriend} onSelect={selectFriend} />
            </div>
            <div className={`chat-conversation-pane ${showChat ? "chat-pane-visible" : "chat-pane-hidden"}`}>
                {selectedFriend ? (
                    selectedImage ? (
                        <ImagePreviewModal
                            image={selectedImage}
                            caption={imageCaption}
                            setCaption={setImageCaption}
                            uploading={uploadingImage}
                            progress={uploadProgress}
                            error={imageError}
                            onCancel={resetImagePreview}
                            onSend={sendImage}
                        />
                    ) : (
                        <>
                            <ChatHeader friend={selectedFriend} onBack={() => setShowChat(false)} typing={
                                selectedFriend
                                    ? typingUsers.has(selectedFriend.id)
                                    : false
                            }/>
                            <ChatMessages
                                messages={messages}
                                onReply={setReplyingTo}
                                onEdit={setEditingMessage}
                                onDelete={deleteForEveryone}
                                onDeleteMe={deleteForMe}
                            />
                            <ChatInput
                                friend={selectedFriend}
                                replyingTo={replyingTo}
                                clearReply={() => setReplyingTo(null)}
                                editingMessage={editingMessage}
                                clearEditing={() => setEditingMessage(null)}
                                onMessageSent={message => setMessages(previous => previous.some(item => item.id === message.id || (message.clientId && item.clientId === message.clientId)) ? previous : [...previous, message])}
                                onImageSelected={(file) => {
                                    setSelectedImage(file);
                                    setImageCaption("");
                                    setImageError("");
                                    setUploadProgress(0);
                                }}
                            />
                        </>
                    )
                ) : <div className="chat-empty-state">
                    <div className="chat-empty-icon"><MessageCircleMore size={34}/></div>
                    <h2>Choose a conversation</h2>
                    <p>Select a friend to start chatting.</p>
                    <button type="button" className="chat-empty-cta" onClick={() => setShowChat(false)}><Plus size={18}/>Start New Chat</button>
                </div>}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title={confirmConfig?.title}
                message={confirmConfig?.message}
                confirmText={confirmConfig?.confirmText}
                cancelText={confirmConfig?.cancelText}
                confirmVariant={confirmConfig?.confirmVariant}
                onCancel={() => {
                    setConfirmOpen(false);
                }}
                onConfirm={async () => {
                    setConfirmOpen(false);
                    if (confirmCallback) {
                        await confirmCallback();
                    }
                }}
            />
        </div>
    );
}