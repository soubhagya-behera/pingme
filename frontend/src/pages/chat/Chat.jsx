import { useState, useEffect } from "react"; // Combined imports
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatHeader from "../../components/chat/ChatHeader";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatInput from "../../components/chat/ChatInput";
import ChatService from "../../services/ChatService";
import { connectSocket, disconnectSocket } from "../../websocket/socket";

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);

    // Add the useEffect here to listen for incoming socket messages
    useEffect(()=>{

    connectSocket((incoming)=>{

        setMessages(prev => {

    const exists = prev.some(

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

    });

    return ()=>{

        disconnectSocket();

    };

},[]);

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
        await loadHistory(friend);
    }

    return (
        <div className="grid grid-cols-[320px_1fr] gap-6 h-[calc(100vh-140px)]">
            <ChatSidebar
                selectedFriend={selectedFriend}
                onSelect={selectFriend}
            />
            <div className="rounded-3xl border bg-white flex flex-col overflow-hidden">
                {
                    selectedFriend ? (
                        <>
                            <ChatHeader friend={selectedFriend} />
                            <ChatMessages
                                messages={messages}
                            />
                            <ChatInput
    friend={selectedFriend}
    onMessageSent={(message)=>{

        setMessages(prev=>[

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
                    )
                }
            </div>
        </div>
    );
}