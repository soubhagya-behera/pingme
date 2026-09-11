import { useRef } from "react";
import toast from "react-hot-toast";
import ChatService from "../../../../services/ChatService";
import { sendActiveConversation } from "../../../../websocket/publisher";
import { whenSocketConnected } from "../../../../websocket/socket";
import * as offlineDB from "../../../../offline/db";

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
            const rawHistory = [...page.content].reverse();
            // Normalize server history to expose clientId for dedup (backend now returns clientMessageId)
            const history = rawHistory.map(m => m.clientMessageId && !m.clientId ? { ...m, clientId: m.clientMessageId } : m);
            // merge any pending offline messages (survives refresh) keeping order
            let pendingForConv = [];
            try { pendingForConv = await offlineDB.getPendingByConversation(friend.id) || []; } catch {}
            pendingForConv.sort((a,b)=> { const d=new Date(a.createdAt)-new Date(b.createdAt); return d!==0?d:((a.seq||0)-(b.seq||0)); });
            const myId = Number(localStorage.getItem("userId"));
            const pendingMsgs = pendingForConv.map(p=>({
                id: p.clientMessageId, clientId: p.clientMessageId, senderId: myId, receiverId: p.receiverId,
                content: p.content, messageType: p.messageType, replyToId: p.replyToId,
                attachmentUrl: p.attachmentUrl, attachmentName: p.attachmentName, attachmentSize: p.attachmentSize,
                attachmentMimeType: p.attachmentMimeType, attachmentDuration: p.attachmentDuration,
                status: p.status === "SYNCING" ? "SYNCING" : "PENDING", sentAt: p.createdAt, createdAt: p.createdAt,
            }));
            const merged = uniqueMessages([...history, ...pendingMsgs]);
            setMessages(merged);
            setHasMoreMessages(!page.last);
            setHistoryLoaded(true);
            paginationRef.current = { friendId: friend.id, nextPage: 1, hasMore: !page.last, loading: false };
            // cache for offline viewing (do not include pending, only server history)
            try { await offlineDB.setHistoryCache(friend.id, { messages: history, hasMore: !page.last, nextPage: 1 }); } catch {}

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
                // offline fallback: load cached history + pending
                let cached = null;
                try { cached = await offlineDB.getHistoryCache(friend.id); } catch {}
                if (cached?.messages?.length) {
                    const normalizedCached = cached.messages.map(m => m.clientMessageId && !m.clientId ? { ...m, clientId: m.clientMessageId } : m);
                    let pendingForConv = [];
                    try { pendingForConv = await offlineDB.getPendingByConversation(friend.id) || []; } catch {}
                    pendingForConv.sort((a,b)=> { const d=new Date(a.createdAt)-new Date(b.createdAt); return d!==0?d:((a.seq||0)-(b.seq||0)); });
                    const myId = Number(localStorage.getItem("userId"));
                    const pendingMsgs = pendingForConv.map(p=>({
                        id: p.clientMessageId, clientId: p.clientMessageId, senderId: myId, receiverId: p.receiverId,
                        content: p.content, messageType: p.messageType, replyToId: p.replyToId,
                        attachmentUrl: p.attachmentUrl, attachmentName: p.attachmentName, attachmentSize: p.attachmentSize,
                        attachmentMimeType: p.attachmentMimeType, attachmentDuration: p.attachmentDuration,
                        status: p.status === "SYNCING" ? "SYNCING" : "PENDING", sentAt: p.createdAt, createdAt: p.createdAt,
                    }));
                    const merged = uniqueMessages([...normalizedCached, ...pendingMsgs]);
                    setMessages(merged);
                    setHasMoreMessages(cached.hasMore ?? false);
                    paginationRef.current = { friendId: friend.id, nextPage: cached.nextPage ?? 1, hasMore: cached.hasMore ?? false, loading: false };
                } else {
                    // try just pending if no cache
                    let pendingForConv = [];
                    try { pendingForConv = await offlineDB.getPendingByConversation(friend.id) || []; } catch {}
                    if (pendingForConv.length) {
                        pendingForConv.sort((a,b)=> { const d=new Date(a.createdAt)-new Date(b.createdAt); return d!==0?d:((a.seq||0)-(b.seq||0)); });
                        const myId = Number(localStorage.getItem("userId"));
                        const pendingMsgs = pendingForConv.map(p=>({
                            id: p.clientMessageId, clientId: p.clientMessageId, senderId: myId, receiverId: p.receiverId,
                            content: p.content, messageType: p.messageType, replyToId: p.replyToId,
                            attachmentUrl: p.attachmentUrl, attachmentName: p.attachmentName, attachmentSize: p.attachmentSize,
                            attachmentMimeType: p.attachmentMimeType, attachmentDuration: p.attachmentDuration,
                            status: p.status === "SYNCING" ? "SYNCING" : "PENDING", sentAt: p.createdAt, createdAt: p.createdAt,
                        }));
                        setMessages(pendingMsgs);
                    } else {
                        setMessages([]);
                    }
                    paginationRef.current = { friendId: friend.id, nextPage: 0, hasMore: false, loading: false };
                }
                setHistoryLoaded(true);
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
            const rawOlder = [...page.content].reverse();
            const olderMessages = rawOlder.map(m => m.clientMessageId && !m.clientId ? { ...m, clientId: m.clientMessageId } : m);
            setMessages(previous => uniqueMessages([...olderMessages, ...previous]));
            pagination.nextPage += 1;
            pagination.hasMore = !page.last;
            setHasMoreMessages(pagination.hasMore);
            setPrependVersion(version => version + 1);
            // update cache with accumulated messages (merge)
            try {
                const cached = await offlineDB.getHistoryCache(pagination.friendId);
                const allCached = cached?.messages ? uniqueMessages([...olderMessages, ...cached.messages]) : olderMessages;
                await offlineDB.setHistoryCache(pagination.friendId, { messages: allCached, hasMore: pagination.hasMore, nextPage: pagination.nextPage });
            } catch {}
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
