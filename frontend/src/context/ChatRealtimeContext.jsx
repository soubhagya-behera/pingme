import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

const ChatRealtimeContext = createContext(null);

export function ChatRealtimeProvider({ children }) {

    // Messages currently visible
    const [messages, setMessages] = useState([]);

    // Friend currently opened in Chat
    const [selectedFriend, setSelectedFriend] = useState(null);

    // Online users
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    // Typing users
    const [typingUsers, setTypingUsers] = useState(new Set());

    // Unread counts
    const [unreadCounts, setUnreadCounts] = useState({});

    // Keep latest selected friend
    const selectedFriendRef = useRef(null);

    useEffect(() => {

        selectedFriendRef.current = selectedFriend;

    }, [selectedFriend]);

    const value = {

        messages,
        setMessages,

        selectedFriend,
        setSelectedFriend,

        selectedFriendRef,

        onlineUsers,
        setOnlineUsers,

        typingUsers,
        setTypingUsers,

        unreadCounts,
        setUnreadCounts

    };

    return (

        <ChatRealtimeContext.Provider value={value}>

            {children}

        </ChatRealtimeContext.Provider>

    );

}

export function useRealtimeChat() {

    return useContext(ChatRealtimeContext);

}