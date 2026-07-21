import { useState, useEffect, useRef } from "react";
import ChatSidebar from "../../../components/user/chat/ChatSidebar";
import ChatHeader from "../../../components/user/chat/ChatHeader";
import ChatMessages from "../../../components/user/chat/ChatMessages";
import ChatInput from "../../../components/user/chat/ChatInput";
import ChatService from "../../../services/ChatService";
import { acknowledgeRead } from "../../../websocket/publisher";
import { useSocket } from "../../../context/SocketProvider";

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
    const socket = useSocket();

    const {
        onTyping,
        onMessageEdited
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
        catch (error) { console.error(error); }
        finally { setLoading(false); }
    }

    async function selectFriend(friend) {
        setSelectedFriend(friend); setShowChat(true);
        try {
            const history = await ChatService.getHistory(friend.id);
            setMessages(history.data.data);
            await ChatService.markConversationRead(friend.id);
            setMessages(previous => previous.map(message => message.senderId === friend.id ? { ...message, status: "READ" } : message));
        } catch (error) { console.error(error); }
    }

    if (loading) return <div className="flex justify-center items-center h-full">Loading chats...</div>;
    return <div className="h-[calc(100vh-140px)] flex">
        <div className={`w-full md:w-[360px] ${showChat ? "hidden md:block" : "block"}`}>
            <ChatSidebar friends={friends} selectedFriend={selectedFriend} onSelect={selectFriend} />
        </div>
        <div className={`flex-1 ${showChat ? "block" : "hidden md:flex"} rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden`}>
            {selectedFriend ? <>
                <ChatHeader friend={selectedFriend} onBack={() => setShowChat(false)} typing={
                    selectedFriend
                        ? typingUsers.has(selectedFriend.id)
                        : false
                }/>
                <ChatMessages
                    messages={messages}
                    onReply={setReplyingTo}
                    onEdit={setEditingMessage}
                />
                <ChatInput
                    friend={selectedFriend}
                    replyingTo={replyingTo}
                    clearReply={() => setReplyingTo(null)}
                    editingMessage={editingMessage}
                    clearEditing={() => setEditingMessage(null)}
                    onMessageSent={message =>
                        setMessages(previous => [...previous, message])
                    }
                />
            </> : <div className="flex-1 flex items-center justify-center text-slate-400 text-xl">Select a friend to start chatting</div>}
        </div>
    </div>;
}