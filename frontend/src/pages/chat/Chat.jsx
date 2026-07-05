import { useState, useEffect, useRef } from "react";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatHeader from "../../components/chat/ChatHeader";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatInput from "../../components/chat/ChatInput";
import ChatService from "../../services/ChatService";
import { connectSocket, disconnectSocket } from "../../websocket/socket";

export default function Chat() {

    const [selectedFriend, setSelectedFriend] = useState(null);

    const selectedFriendRef = useRef(null);

    const [messages, setMessages] = useState([]);

    const [friends, setFriends] = useState([]);

    useEffect(() => {

        loadRecentChats();

    }, []);

    useEffect(() => {

        selectedFriendRef.current = selectedFriend;

    }, [selectedFriend]);

    async function loadRecentChats() {

        try {

            const response =
                await ChatService.getRecentChats();

            setFriends(response.data.data);

        }

        catch (error) {

            console.log(error);

        }

    }

    useEffect(() => {

        connectSocket(

            async (incoming) => {

                await loadRecentChats();

                const myId = Number(localStorage.getItem("userId"));

console.log("MY ID =", myId);
console.log("MESSAGE =", incoming);

if (incoming.receiverId === myId) {

    console.log("Calling Delivered API", incoming.id);

    await ChatService.markDelivered(incoming.id);

}

                setMessages(prev => {

                    const currentFriend =
                        selectedFriendRef.current;

                    if (

                        currentFriend &&

                        incoming.senderId !== currentFriend.id &&

                        incoming.receiverId !== currentFriend.id

                    ) {

                        return prev;

                    }

                    const exists =
                        prev.some(

                            m => m.id === incoming.id

                        );

                    if (exists) {

                        return prev;

                    }

                    return [

                        ...prev,

                        incoming

                    ];

                });

            },

            (status) => {

                setFriends(prev =>

                    prev.map(friend =>

                        friend.friendId === status.userId

                            ? {

                                ...friend,

                                online: status.online

                            }

                            : friend

                    )

                );

                setSelectedFriend(prev => {

                    if (!prev) return prev;

                    if (prev.id !== status.userId)

                        return prev;

                    return {

                        ...prev,

                        online: status.online

                    };

                });

            },

            (messageStatus) => {

    console.log("STATUS EVENT", messageStatus);

    setMessages(prev => {

        console.log("CURRENT MESSAGES", prev);

        return prev.map(message => {

            console.log(
                "Comparing",
                message.id,
                messageStatus.messageId
            );

            if (message.id === messageStatus.messageId) {

                console.log("MATCH FOUND");

                return {

                    ...message,

                    status: messageStatus.status

                };

            }

            return message;

        });

    });

}

        );

        return () => {

            disconnectSocket();

        };

    }, []);

    async function loadHistory(friend) {

        try {

            const response =
                await ChatService.getHistory(friend.id);

            setMessages(response.data.data);

        }

        catch (error) {

            console.log(error);

        }

    }

    async function selectFriend(friend) {

        setSelectedFriend(friend);

        setMessages([]);

        await loadHistory(friend);

        await ChatService.markConversationRead(
            friend.id
        );

    }

    return (

        <div className="grid grid-cols-[320px_1fr] gap-6 h-[calc(100vh-140px)]">

            <ChatSidebar

                friends={friends}

                selectedFriend={selectedFriend}

                onSelect={selectFriend}

            />

            <div className="rounded-3xl border bg-white flex flex-col overflow-hidden">

                {

                    selectedFriend ?

                        <>

                            <ChatHeader

                                friend={selectedFriend}

                            />

                            <ChatMessages

                                messages={messages}

                            />

                            <ChatInput

                                friend={selectedFriend}

                            />

                        </>

                        :

                        <div className="flex-1 flex items-center justify-center text-slate-400 text-xl">

                            Select a friend to start chatting

                        </div>

                }

            </div>

        </div>

    );

}