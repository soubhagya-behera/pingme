import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import ChatSidebar from "../../../components/user/chat/ChatSidebar";
import ChatHeader from "../../../components/user/chat/ChatHeader";
import ChatMessages from "../../../components/user/chat/ChatMessages";
import ChatInput from "../../../components/user/chat/ChatInput";
import ChatSearchBar from "../../../components/user/chat/ChatSearchBar";
import ChatSearchResults from "../../../components/user/chat/ChatSearchResults";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import ChatService from "../../../services/ChatService";
import { sendActiveConversation } from "../../../websocket/publisher";
import { useSocket } from "../../../context/SocketProvider";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import { ArrowLeft, MessageCircleMore, Plus, Trash2 } from "lucide-react";
import { onSocketConnected } from "../../../websocket/socket";
import "../../../styles/user/chat/chat.css";
import ImagePreviewModal from "../../../components/user/chat/ImagePreviewModal";
import FilePreviewModal from "../../../components/user/chat/FilePreviewModal";
import ForwardMessageModal from "../../../components/user/chat/ForwardMessageModal";
import VoicePreviewModal from "../../../components/user/chat/VoicePreviewModal";
import { isImageAttachment } from "../../../components/user/chat/AttachmentUtils";
import useMessageSearch from "./hooks/useMessageSearch";
import useChatSocket from "./hooks/useChatSocket";
import useChatHistory from "./hooks/useChatHistory";
import useChatAttachments from "./hooks/useChatAttachments";
import useConnectivity from "../../../hooks/useConnectivity";
import OfflineBanner from "../../../components/user/chat/OfflineBanner";
import { syncPendingMessages, onSyncEvent } from "../../../offline/syncQueue";
import * as offlineDB from "../../../offline/db";

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [conversationKey, setConversationKey] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const selectedFriendRef = useRef(null);
    const initialOpenFriendIdRef = useRef(useLocation().state?.openFriendId ?? null);
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [prependVersion, setPrependVersion] = useState(0);
    const [scrollToBottomRequest, setScrollToBottomRequest] = useState(0);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [confirmCallback, setConfirmCallback] = useState(null);

    const { user } = useAuth();
    const socket = useSocket();
    const { markConversationNotificationsRead } = useNotifications();
    const connectivity = useConnectivity();
    const messagesRef = useRef([]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { selectedFriendRef.current = selectedFriend; }, [selectedFriend]);
    useEffect(() => { return () => { sendActiveConversation(null); }; }, []);

    const bannerRef = useRef(connectivity.banner);
    useEffect(() => { bannerRef.current = connectivity.banner; }, [connectivity.banner]);
    // Offline-first: listen for sync events to reconcile messages (stable listener, no thrash)
    useEffect(() => {
        const unsub = onSyncEvent(ev => {
            if (ev.type === "syncing") {
                setMessages(prev => prev.map(m => (m.clientId === ev.clientMessageId || m.id === ev.clientMessageId) ? { ...m, status: "SYNCING" } : m));
                connectivity.notifySyncing?.();
            } else if (ev.type === "sent") {
                const srv = ev.serverMsg;
                if (srv) {
                    setMessages(prev => {
                        const idx = prev.findIndex(m => m.clientId === ev.clientMessageId || m.id === ev.clientMessageId);
                        if (idx !== -1) {
                            const next = [...prev];
                            next[idx] = { ...next[idx], ...srv, clientId: ev.clientMessageId };
                            return next;
                        }
                        return prev;
                    });
                } else {
                    setMessages(prev => prev.map(m => (m.clientId === ev.clientMessageId || m.id === ev.clientMessageId) ? { ...m, status: "SENT" } : m));
                }
            } else if (ev.type === "sync-end") {
                if (ev.synced > 0) connectivity.notifySynced?.();
                else if (bannerRef.current === "syncing") connectivity.notifySynced?.();
            }
        });
        return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto sync when coming back online
    useEffect(() => {
        if (connectivity.isOnline) {
            syncPendingMessages().catch(()=>{});
        }
    }, [connectivity.isOnline]);

    // Also sync when WebSocket reconnects
    useEffect(() => {
        const unsub = onSocketConnected(() => syncPendingMessages().catch(()=>{}));
        return unsub;
    }, []);

    // Periodic retry for pending while online (handles transient backend failures)
    useEffect(() => {
        if (!connectivity.isOnline) return;
        const id = setInterval(() => syncPendingMessages().catch(()=>{}), 15000);
        return () => clearInterval(id);
    }, [connectivity.isOnline]);

    // On conversation change, merge pending outbox messages for that conversation
    useEffect(() => {
        if (!selectedFriend) return;
        let cancelled = false;
        offlineDB.getPendingByConversation(selectedFriend.id).then(pending => {
            if (cancelled || !pending || pending.length === 0) return;
            const myId = Number(localStorage.getItem("userId"));
            const pendingMsgs = pending
                .sort((a,b)=> { const d=new Date(a.createdAt)-new Date(b.createdAt); return d!==0?d:((a.seq||0)-(b.seq||0)); })
                .map(p => ({
                    id: p.clientMessageId,
                    clientId: p.clientMessageId,
                    senderId: myId,
                    receiverId: p.receiverId,
                    content: p.content,
                    messageType: p.messageType,
                    replyToId: p.replyToId,
                    attachmentUrl: p.attachmentUrl,
                    attachmentName: p.attachmentName,
                    attachmentSize: p.attachmentSize,
                    attachmentMimeType: p.attachmentMimeType,
                    attachmentDuration: p.attachmentDuration,
                    status: p.status === "SYNCING" ? "SYNCING" : "PENDING",
                    sentAt: p.createdAt,
                    createdAt: p.createdAt,
                }));
            setMessages(prev => {
                // avoid duplicates: check both clientId and numeric id (server history now carries clientId)
                const existingClientIds = new Set(prev.map(m => m.clientId).filter(Boolean));
                const existingIds = new Set(prev.map(m => String(m.id)));
                const toAdd = pendingMsgs.filter(pm => !existingClientIds.has(pm.clientId) && !existingIds.has(String(pm.id)));
                if (toAdd.length === 0) return prev;
                return [...prev, ...toAdd];
            });
            setScrollToBottomRequest(r=>r+1);
        }).catch(()=>{});
        return () => { cancelled = true; };
    }, [selectedFriend?.id]);

    const {
        loadChatSidebar,
        selectFriend: rawSelectFriend,
        loadOlderMessages,
        closeConversation: rawCloseConversation,
        paginationRef,
        historyRequestRef,
    } = useChatHistory({
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
    });

    const search = useMessageSearch({
        selectedFriendRef,
        messagesRef,
        paginationRef,
        loadOlderMessages,
    });

    function selectFriend(friend) {
        search.resetMessageSearch();
        // Exit selection when switching conversation
        setSelectionMode(false);
        setSelectedIds(new Set());
        rawSelectFriend(friend);
    }

    function enterSelectionMode() {
        setSelectionMode(true);
        setSelectedIds(new Set());
    }

    function exitSelectionMode() {
        setSelectionMode(false);
        setSelectedIds(new Set());
    }

    function toggleMessageSelection(messageId) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(messageId)) next.delete(messageId);
            else next.add(messageId);
            return next;
        });
    }

    function handleBulkDeleteSelected() {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        const count = ids.length;
        openConfirm(
            {
                title: "Delete messages?",
                message: count === 1 ? "Delete this message?" : `Delete ${count} messages?`,
                confirmText: "Delete",
                cancelText: "Cancel",
                confirmVariant: "danger"
            },
            async () => {
                try {
                    await ChatService.bulkDelete(ids);
                    setMessages(prev => prev.filter(m => !selectedIds.has(m.id)));
                    if (selectedFriend) {
                        offlineDB.getHistoryCache(selectedFriend.id).then(cached => {
                            if (cached?.messages) {
                                const set = new Set(ids);
                                const filtered = cached.messages.filter(m => !set.has(m.id));
                                offlineDB.setHistoryCache(selectedFriend.id, { ...cached, messages: filtered }).catch(()=>{});
                            }
                        }).catch(()=>{});
                        // also clean pending that match deleted ids via clientId
                        ids.forEach(id => offlineDB.removePending(String(id)).catch(()=>{}));
                    }
                    toast.success(count === 1 ? "Message deleted." : `${count} messages deleted.`);
                    exitSelectionMode();
                    loadChatSidebar();
                } catch (error) {
                    console.error(error);
                    toast.error("Couldn't delete messages. Please try again.");
                }
            }
        );
    }

    function closeConversation() {
        exitSelectionMode();
        rawCloseConversation();
    }

    const attachments = useChatAttachments({
        selectedFriend,
        replyingTo,
        setReplyingTo,
        setMessages,
        setScrollToBottomRequest,
    });

    useChatSocket({
        socket,
        selectedFriendRef,
        setMessages,
        setFriends,
        setSelectedFriend,
        setTypingUsers,
    });

    useEffect(() => { loadChatSidebar(); }, []);

    // Mobile: hide global navbar when an individual conversation is open
    // Keeps list/header visible on Friends, Settings, etc. and on Chat list view.
    useEffect(() => {
        const col = document.querySelector(".app-main-col");
        if (!col) return;
        if (showChat) col.classList.add("is-chat-open");
        else col.classList.remove("is-chat-open");
        return () => col.classList.remove("is-chat-open");
    }, [showChat]);

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
                    setMessages(previous => previous.filter(item => item.id !== message.id));
                    // Also evict from history cache so it doesn't resurrect offline
                    if (selectedFriend) {
                        offlineDB.getHistoryCache(selectedFriend.id).then(cached => {
                            if (cached?.messages) {
                                const filtered = cached.messages.filter(m => m.id !== message.id);
                                offlineDB.setHistoryCache(selectedFriend.id, { ...cached, messages: filtered }).catch(()=>{});
                            }
                        }).catch(()=>{});
                        // If message was pending with same clientId, remove from outbox
                        if (message.clientId) offlineDB.removePending(message.clientId).catch(()=>{});
                    }
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
                    setMessages(previous => previous.filter(item => item.id !== message.id));
                    if (selectedFriend) {
                        offlineDB.getHistoryCache(selectedFriend.id).then(cached => {
                            if (cached?.messages) {
                                const filtered = cached.messages.filter(m => m.id !== message.id);
                                offlineDB.setHistoryCache(selectedFriend.id, { ...cached, messages: filtered }).catch(()=>{});
                            }
                        }).catch(()=>{});
                        if (message.clientId) offlineDB.removePending(message.clientId).catch(()=>{});
                    }
                } catch (error) {
                    console.error(error);
                    toast.error("Couldn't delete the message.");
                }
            }
        );
    }

    function clearChat() {
        if (!selectedFriend) return;
        const targetFriendId = selectedFriend.id;
        openConfirm(
            {
                title: "Clear chat?",
                message: "Are you sure you want to clear this conversation? This will remove all messages from your chat history.",
                confirmText: "Clear Chat",
                cancelText: "Cancel",
                confirmVariant: "danger"
            },
            async () => {
                try {
                    await ChatService.clearChat(targetFriendId);
                    if (historyRequestRef) historyRequestRef.current += 1;
                    setLoadingMore(false);
                    setMessages([]);
                    setHasMoreMessages(false);
                    setHistoryLoaded(true);
                    setPrependVersion(v => v + 1);
                    paginationRef.current = { friendId: targetFriendId, nextPage: 0, hasMore: false, loading: false };
                    setFriends(prev => prev.map(item => item.id === targetFriendId ? { ...item, lastMessage: null, lastMessageTime: null, unreadCount: 0 } : item));
                    search.resetMessageSearch();
                    setConversationKey(`${targetFriendId}:cleared:${Date.now()}`);
                    // Offline cache/outbox cleanup: prevent resurrecting cleared messages
                    offlineDB.removeHistoryCache(targetFriendId).catch(()=>{});
                    offlineDB.getPendingByConversation(targetFriendId).then(pendings => {
                        const deletions = (pendings||[]).map(p=> offlineDB.removePending(p.clientMessageId));
                        return Promise.all(deletions);
                    }).catch(()=>{});
                    toast.success("Chat cleared.");
                    loadChatSidebar();
                } catch (error) {
                    console.error(error);
                    toast.error("Couldn't clear chat. Please try again.");
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
                    <>
                        {selectionMode ? (
                            <header className="chat-header is-select-mode">
                                <div className="chat-header-person">
                                    <button type="button" onClick={exitSelectionMode} className="chat-header-back" aria-label="Cancel selection" style={{ display: 'grid' }}><ArrowLeft size={21} /></button>
                                    <div><h2>{selectedIds.size === 0 ? "Select messages" : `${selectedIds.size} selected`}</h2></div>
                                </div>
                                <div className="chat-header-actions">
                                    <button type="button" aria-label="Delete selected messages" title={selectedIds.size === 0 ? "No messages selected" : "Delete"} onClick={handleBulkDeleteSelected} disabled={selectedIds.size === 0} style={{ opacity: selectedIds.size === 0 ? 0.45 : 1 }}><Trash2 size={18} /></button>
                                </div>
                            </header>
                        ) : search.messageSearchOpen ? (
                            <ChatSearchBar
                                query={search.searchQuery}
                                onQueryChange={search.setSearchQuery}
                                onClose={search.closeMessageSearch}
                                onNext={search.goToNextResult}
                                onPrev={search.goToPrevResult}
                                onToggleResults={() => search.setResultsVisible(v => !v)}
                                resultsVisible={search.resultsVisible}
                                results={search.searchResults}
                                activeIndex={search.activeResultIndex}
                                searching={search.searching}
                                error={search.searchError}
                                jumpLoading={search.jumpLoading}
                            />
                        ) : (
                            <ChatHeader friend={selectedFriend} onBack={closeConversation} onSearch={search.openMessageSearch} onClearChat={clearChat} onSelectMessages={enterSelectionMode} typing={selectedFriend ? typingUsers.has(selectedFriend.id) : false} />
                        )}
                        <OfflineBanner banner={connectivity.banner} />
                        {search.messageSearchOpen && (
                            <ChatSearchResults
                                results={search.searchResults}
                                query={search.searchQuery}
                                activeIndex={search.activeResultIndex}
                                searching={search.searching}
                                error={search.searchError}
                                friend={selectedFriend}
                                me={{ id: Number(localStorage.getItem("userId")), name: user?.name, profilePicture: user?.profilePicture }}
                                onSelect={search.selectSearchResult}
                            />
                        )}
                        <ChatMessages
                            messages={messages}
                            conversationId={conversationKey}
                            historyLoaded={historyLoaded}
                            loadingMore={loadingMore}
                            hasMoreMessages={hasMoreMessages}
                            prependVersion={prependVersion}
                            scrollToBottomRequest={scrollToBottomRequest}
                            onLoadMore={loadOlderMessages}
                            onReply={setReplyingTo}
                            onEdit={setEditingMessage}
                            onDelete={deleteForEveryone}
                            onDeleteMe={deleteForMe}
                            onForward={attachments.setForwardingMessage}
                            highlightQuery={search.searchQuery.trim()}
                            searchActive={search.messageSearchOpen}
                            scrollToMessageId={search.searchJump.messageId ?? null}
                            scrollToMessageVersion={search.searchJump.version}
                            selectionMode={selectionMode}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleMessageSelection}
                        />
                        <ChatInput
                            friend={selectedFriend}
                            replyingTo={replyingTo}
                            clearReply={() => setReplyingTo(null)}
                            editingMessage={editingMessage}
                            clearEditing={() => setEditingMessage(null)}
                            onMessageSent={message => {
                                setMessages(previous => {
                                    const index = previous.findIndex(item => item.id === message.id || (message.clientId && item.clientId === message.clientId));
                                    if (index === -1) return [...previous, message];
                                    const next = [...previous];
                                    next[index] = { ...next[index], ...message };
                                    return next;
                                });
                                if (message.status === "PENDING" || message.status === "SENDING") setScrollToBottomRequest(r => r + 1);
                            }}
                            onAttachmentSelected={file => {
                                attachments.setSelectedAttachment(file);
                                attachments.setAttachmentCaption("");
                                attachments.setAttachmentError("");
                                attachments.setUploadProgress(0);
                            }}
                            onVoiceRecorded={(file, duration) => {
                                attachments.setVoicePreview({ file, duration });
                                attachments.setVoiceError("");
                                attachments.setVoiceUploadProgress(0);
                            }}
                        />
                        {attachments.selectedAttachment && (isImageAttachment({ attachmentMimeType: attachments.selectedAttachment.type }) ? (
                            <ImagePreviewModal image={attachments.selectedAttachment} caption={attachments.attachmentCaption} setCaption={attachments.setAttachmentCaption} uploading={attachments.uploadingAttachment} progress={attachments.uploadProgress} error={attachments.attachmentError} onCancel={attachments.resetAttachmentPreview} onSend={attachments.sendAttachment} />
                        ) : (
                            <FilePreviewModal file={attachments.selectedAttachment} caption={attachments.attachmentCaption} setCaption={attachments.setAttachmentCaption} uploading={attachments.uploadingAttachment} progress={attachments.uploadProgress} error={attachments.attachmentError} onCancel={attachments.resetAttachmentPreview} onSend={attachments.sendAttachment} />
                        ))}
                        {attachments.voicePreview && (
                            <VoicePreviewModal file={attachments.voicePreview.file} duration={attachments.voicePreview.duration} uploading={attachments.sendingVoice} progress={attachments.voiceUploadProgress} error={attachments.voiceError} onCancel={attachments.resetVoicePreview} onSend={attachments.sendVoiceMessage} />
                        )}
                    </>
                ) : <div className="chat-empty-state">
                    <div className="chat-empty-icon"><MessageCircleMore size={34}/></div>
                    <h2>Choose a conversation</h2>
                    <p>Select a friend to start chatting.</p>
                    <button type="button" className="chat-empty-cta" onClick={closeConversation}><Plus size={18}/>Start New Chat</button>
                </div>}
            </div>

            {attachments.forwardingMessage && (
                <ForwardMessageModal
                    message={attachments.forwardingMessage}
                    friends={friends}
                    loading={attachments.forwarding}
                    onClose={() => { if (!attachments.forwarding) attachments.setForwardingMessage(null); }}
                    onForward={attachments.forwardMessage}
                />
            )}

            <ConfirmDialog
                open={confirmOpen}
                title={confirmConfig?.title}
                message={confirmConfig?.message}
                confirmText={confirmConfig?.confirmText}
                cancelText={confirmConfig?.cancelText}
                confirmVariant={confirmConfig?.confirmVariant}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={async () => {
                    setConfirmOpen(false);
                    if (confirmCallback) await confirmCallback();
                }}
            />
        </div>
    );
}
