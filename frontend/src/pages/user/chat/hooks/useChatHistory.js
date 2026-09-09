import { useRef } from "react";
import toast from "react-hot-toast";
import ChatService from "../../../../services/ChatService";
import { sendActiveConversation } from "../../../../websocket/publisher";
import { whenSocketConnected } from "../../../../websocket/socket";

function uniqueMessages(messages) {
    const seenIds = new Set();
    const seenClientIds = new Set();
    return messages.filter(message => {
        const idKey = message.id;
        const clientKey = message.clientId;
        if ((idKey != null && seenIds.has(idKey)) || (clientKey && seenClientIds.has(clientKey))) return false;
        if (idKey != null) seenIds.add(idKey);
        if (clientKey) seenClientIds.add(clientKey);
        return true;
    });
}

export default function useChatHistory({
    selectedFriendRef,
    setSelectedFriend,
    setConversationKey,
    setShowChat,
    setMessages,
    setHasMoreMessages,
    setLoadingMore,
    setHistoryLoaded,
    setPrependVersion,
    setFriends,
    setLoading,
    markConversationNotificationsRead,
    initialOpenFriendIdRef,
}) {
    const historyRequestRef = useRef(0);
    const paginationRef = useRef({ friendId: null, nextPage: 0, hasMore: false, loading: false });

    function setActiveChat(friendId) {
        whenSocketConnected(() => sendActiveConversation(friendId));
    }

    async function loadChatSidebar() {
        try {
            const data = (await ChatService.getChatSidebar()).data.data;
            setFriends(data);
            const openId = initialOpenFriendIdRef.current;
            if (openId) {
                const target = data.find(friend => friend.id === openId);
                if (target) {
                    initialOpenFriendIdRef.current = null;
                    selectFriend(target);
                }
            }
        }
        catch { setFriends([]); }
        finally { setLoading(false); }
    }

    async function selectFriend(friend) {
        const requestId = ++historyRequestRef.current;
        selectedFriendRef.current = friend;
        setSelectedFriend(friend);
        setActiveChat(friend.id);
        setConversationKey(`${friend.id}:${requestId}`);
        setShowChat(true);
        setMessages([]);
        setHasMoreMessages(true);
        setLoadingMore(false);
        setHistoryLoaded(false);
        paginationRef.current = { friendId: friend.id, nextPage: 0, hasMore: true, loading: false };

        try {
            const response = await ChatService.getHistory(
                friend.id,
                0,
                20
            );
            if (requestId !== historyRequestRef.current) return;
            const page = response.data.data;
            const history = [...page.content].reverse();
            setMessages(previous => uniqueMessages([...history, ...previous]));
            setHasMoreMessages(!page.last);
            setHistoryLoaded(true);
            paginationRef.current = { friendId: friend.id, nextPage: 1, hasMore: !page.last, loading: false };

            await ChatService.markConversationRead(friend.id);
            markConversationNotificationsRead(friend.id);
            setFriends(previous =>
                previous.map(item =>
                    item.id === friend.id
                        ?
                        {
                            ...item,
                            unreadCount: 0
                        }
                        :
                        item
                )
            );
            setMessages(previous =>
                previous.map(message =>
                    message.senderId === friend.id
                        ?
                        {
                            ...message,
                            status: "READ"
                        }
                        :
                        message
                )
            );
        }
        catch {
            if (requestId === historyRequestRef.current) {
                setMessages([]);
                setHistoryLoaded(true);
                paginationRef.current = { friendId: friend.id, nextPage: 0, hasMore: false, loading: false };
            }
        }
    }

    async function loadOlderMessages() {
        const pagination = paginationRef.current;
        if (pagination.loading || !pagination.hasMore || !pagination.friendId) return;

        try {
            pagination.loading = true;
            setLoadingMore(true);
            const response = await ChatService.getHistory(
                pagination.friendId,
                pagination.nextPage,
                20
            );
            if (pagination !== paginationRef.current) return;
            const page = response.data.data;
            const olderMessages = [...page.content].reverse();
            setMessages(previous => uniqueMessages([...olderMessages, ...previous]));
            pagination.nextPage += 1;
            pagination.hasMore = !page.last;
            setHasMoreMessages(pagination.hasMore);
            setPrependVersion(version => version + 1);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            if (pagination === paginationRef.current) {
                pagination.loading = false;
                setLoadingMore(false);
            }
        }
    }

    function closeConversation() {
        setActiveChat(null);
        setShowChat(false);
    }

    return {
        loadChatSidebar,
        selectFriend,
        loadOlderMessages,
        closeConversation,
        setActiveChat,
        paginationRef,
        historyRequestRef,
    };
}
