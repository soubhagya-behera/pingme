import { useState, useEffect } from "react";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatHeader from "../../components/chat/ChatHeader";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatInput from "../../components/chat/ChatInput";
import ChatService from "../../services/ChatService";
import FriendService from "../../services/FriendService";
import { connectSocket, disconnectSocket } from "../../websocket/socket";

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        loadFriends();
    }, []);

    async function loadFriends() {
        try {
            const response = await FriendService.getFriends();
            setFriends(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        connectSocket(
            (incoming) => {
                setMessages((prev) => {
                    if (
                        selectedFriend &&
                        incoming.senderId !== selectedFriend.id &&
                        incoming.receiverId !== selectedFriend.id
                    ) {
                        return prev;
                    }
                    const exists = prev.some((m) => m.id === incoming.id);
                    if (exists) {
                        return prev;
                    }
                    return [...prev, incoming];
                });
            },
            (status) => {

    console.log("Status update:", status);

    setFriends(prev =>
        prev.map(friend =>
            friend.id === status.userId
                ? { ...friend, online: status.online }
                : friend
        )
    );

    setSelectedFriend(prev => {

        if (!prev) return prev;

        if (prev.id !== status.userId) return prev;

        return {

            ...prev,

            online: status.online

        };

    });

}
        );

        return () => {
            disconnectSocket();
        };
    }, []);

    // Load chat history
    async function loadHistory(friend) {
        try {
            const response = await ChatService.getHistory(friend.id);
            setMessages(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    // When user selects a friend
    async function selectFriend(friend) {
        setSelectedFriend(friend);
        setMessages([]);
        await loadHistory(friend);
    }

    return (
        <div className="grid grid-cols-[320px_1fr] gap-6 h-[calc(100vh-140px)]">
            <ChatSidebar
                friends={friends}
                selectedFriend={selectedFriend}
                onSelect={selectFriend}
            />
            <div className="rounded-3xl border bg-white flex flex-col overflow-hidden">
                {selectedFriend ? (
                    <>
                        <ChatHeader friend={selectedFriend} />
                        <ChatMessages messages={messages} />
                        <ChatInput
    friend={selectedFriend}
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