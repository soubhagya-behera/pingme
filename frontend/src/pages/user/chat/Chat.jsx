import { useState, useEffect, useRef } from "react";
import ChatSidebar from "../../../components/user/chat/ChatSidebar";
import ChatHeader from "../../../components/user/chat/ChatHeader";
import ChatMessages from "../../../components/user/chat/ChatMessages";
import ChatInput from "../../../components/user/chat/ChatInput";
import ChatService from "../../../services/ChatService";
import { connectSocket, disconnectSocket } from "../../../websocket/socket";
import { subscribeMessages, subscribePresence, subscribeMessageStatus } from "../../../websocket/subscriptions";

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const selectedFriendRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChatSidebar();
    }, []);

    useEffect(() => {
        selectedFriendRef.current = selectedFriend;
    }, [selectedFriend]);

    async function loadChatSidebar() {

    try {

        const response =
            await ChatService.getChatSidebar();

        setFriends(

            response.data.data

        );

        setLoading(false);

    }

    catch (error) {

        console.log(error);

        setLoading(false);

    }

}

    useEffect(() => {
        let messageSubscription;
        let presenceSubscription;
        let statusSubscription;

        connectSocket(() => {
            // 1. Private Messages Subscription
            messageSubscription = subscribeMessages(async (incoming) => {
                const myId = Number(localStorage.getItem("userId"));

                if (incoming.receiverId === myId) {
                    await ChatService.markDelivered(incoming.id);
                }

                setMessages((prev) => {
                    const currentFriend = selectedFriendRef.current;
                    if (
                        currentFriend &&
                        incoming.senderId !== currentFriend.id &&
                        incoming.receiverId !== currentFriend.id
                    ) {
                        return prev;
                    }
                    const exists = prev.some((m) => m.id === incoming.id);
                    if (exists) {
                        return prev;
                    }
                    return [...prev, incoming];
                });
            });

            // 2. Online / Offline Presence Subscription
            presenceSubscription = subscribePresence((status) => {
                setFriends((prev) =>
                    prev.map((friend) =>
                        friend.id === status.userId
                            ? { ...friend, online: status.online }
                            : friend
                    )
                );

                setSelectedFriend((prev) => {
                    if (!prev) return prev;
                    if (prev.id !== status.userId) return prev;
                    return { ...prev, online: status.online };
                });
            });

            // 3. Message Status (Delivered / Read) Subscription
            statusSubscription = subscribeMessageStatus((messageStatus) => {
                setMessages((prev) =>
                    prev.map((message) =>
                        message.id === messageStatus.messageId
                            ? { ...message, status: messageStatus.status }
                            : message
                    )
                );
            });
        });

        return () => {
            if (messageSubscription) messageSubscription.unsubscribe();
            if (presenceSubscription) presenceSubscription.unsubscribe();
            if (statusSubscription) statusSubscription.unsubscribe();
            disconnectSocket();
        };
    }, []);

    async function loadHistory(friend) {
        try {
            const response = await ChatService.getHistory(friend.id);
            setMessages(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function selectFriend(friend) {
        setSelectedFriend(friend);
        setMessages([]);
        await loadHistory(friend);
        await ChatService.markConversationRead(friend.id);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                Loading chats...
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[360px_1fr] gap-4 h-[calc(100vh-140px)]">
            <ChatSidebar
                friends={friends}
                selectedFriend={selectedFriend}
                onSelect={selectFriend}
            />

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
                {selectedFriend ? (
                    <>
                        <ChatHeader friend={selectedFriend} />
                        <ChatMessages messages={messages} />
                        <ChatInput
    friend={selectedFriend}
    onMessageSent={(message) => {

        setMessages(prev => [

            ...prev,

            message

        ]);

    }}
/>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xl">
                        Select a friend to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}