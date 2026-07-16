import { useState, useEffect, useRef } from "react";
import ChatSidebar from "../../../components/user/chat/ChatSidebar";
import ChatHeader from "../../../components/user/chat/ChatHeader";
import ChatMessages from "../../../components/user/chat/ChatMessages";
import ChatInput from "../../../components/user/chat/ChatInput";
import ChatService from "../../../services/ChatService";
import {

    whenSocketConnected

}
from "../../../websocket/socket";
import { subscribeMessages, subscribePresence, subscribeMessageStatus } from "../../../websocket/subscriptions";

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showChat, setShowChat] = useState(false);
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
            const response = await ChatService.getChatSidebar();
            setFriends(response.data.data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        let messageSubscription;
        let presenceSubscription;
        let statusSubscription;

        whenSocketConnected(() => {
            // 1. Private Messages Subscription
            messageSubscription = subscribeMessages(async (incoming) => {
                console.log("========== MESSAGE RECEIVED ==========");
                console.log(incoming);

                const myId = Number(localStorage.getItem("userId"));

                console.log("My Id :", myId);
                console.log("Receiver :", incoming.receiverId);

                // Receiver gets message -> Delivered
                if (incoming.receiverId === myId) {
                    console.log("CALLING markDelivered");
                    await ChatService.markDelivered(incoming.id);
                    console.log("markDelivered FINISHED");
                }

                // If receiver is currently viewing THIS chat,
                // immediately mark it READ.
                if (
                    selectedFriendRef.current &&
                    incoming.senderId === selectedFriendRef.current.id
                ) {
                    await ChatService.markRead(incoming.id);
                }

                setMessages(prev => {
                    // Replace optimistic message
                    const optimisticIndex = prev.findIndex(
                        m => m.clientId && m.clientId === incoming.clientId
                    );

                    if (optimisticIndex !== -1) {
                        const copy = [...prev];
                        copy[optimisticIndex] = incoming;
                        return copy;
                    }

                    // Ignore if another chat
                    const currentFriend = selectedFriendRef.current;
                    if (
                        currentFriend &&
                        incoming.senderId !== currentFriend.id &&
                        incoming.receiverId !== currentFriend.id
                    ) {
                        return prev;
                    }

                    if (prev.some(m => m.id === incoming.id)) {
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

    messageSubscription?.unsubscribe();

    presenceSubscription?.unsubscribe();

    statusSubscription?.unsubscribe();

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
        setShowChat(true);
        const response = await ChatService.getHistory(friend.id);
        setMessages(response.data.data);
        await ChatService.markConversationRead(friend.id);
        
        setMessages(prev =>
            prev.map(message =>
                message.senderId === friend.id
                    ? { ...message, status: "READ" }
                    : message
            )
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                Loading chats...
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex">
            <div
className={`
w-full
md:w-[360px]
${showChat ? "hidden md:block" : "block"}
`}
>

<ChatSidebar
friends={friends}
selectedFriend={selectedFriend}
onSelect={selectFriend}
/>

</div>

            <div
className={`
flex-1
${showChat ? "block" : "hidden md:flex"}
rounded-3xl
border
border-slate-200
bg-white
shadow-sm
flex
flex-col
overflow-hidden
`}
>
                {selectedFriend ? (
                    <>
                        <ChatHeader

friend={selectedFriend}

onBack={() => {

setShowChat(false);

}}

 />
                        <ChatMessages messages={messages} />
                        <ChatInput
                            friend={selectedFriend}
                            onMessageSent={(message) => {
                                setMessages(prev => [...prev, message]);
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