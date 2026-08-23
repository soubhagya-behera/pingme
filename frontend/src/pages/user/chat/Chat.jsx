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
import { acknowledgeRead } from "../../../websocket/publisher";
import { sendActiveConversation } from "../../../websocket/publisher";
import { whenSocketConnected } from "../../../websocket/socket";
import { useSocket } from "../../../context/SocketProvider";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import { MessageCircleMore, Plus } from "lucide-react";
import "../../../styles/user/chat/chat.css";
import ImagePreviewModal from "../../../components/user/chat/ImagePreviewModal";
import FilePreviewModal from "../../../components/user/chat/FilePreviewModal";
import ForwardMessageModal from "../../../components/user/chat/ForwardMessageModal";
import VoicePreviewModal from "../../../components/user/chat/VoicePreviewModal";
import { isImageAttachment } from "../../../components/user/chat/AttachmentUtils";
import useDebounce from "../../../hooks/useDebounce";
import { v4 as uuid } from "uuid";

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

export default function Chat() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [conversationKey, setConversationKey] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const selectedFriendRef = useRef(null);
    const initialOpenFriendIdRef = useRef(
        useLocation().state?.openFriendId ?? null
    );
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
    const [forwardingMessage, setForwardingMessage] = useState(null);
const [forwarding, setForwarding] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState(null);


    const [attachmentCaption, setAttachmentCaption] = useState("");
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [attachmentError, setAttachmentError] = useState("");

    const [voicePreview, setVoicePreview] = useState(null);
    const [sendingVoice, setSendingVoice] = useState(false);
    const [voiceUploadProgress, setVoiceUploadProgress] = useState(0);
    const [voiceError, setVoiceError] = useState("");

    // Message search state (scoped to the selected conversation).
    const { user } = useAuth();
    const [messageSearchOpen, setMessageSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const [resultsVisible, setResultsVisible] = useState(true);
    const [activeResultIndex, setActiveResultIndex] = useState(-1);
    const [jumpLoading, setJumpLoading] = useState(false);
    const [searchJump, setSearchJump] = useState({ messageId: null, version: 0 });

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const searchRequestIdRef = useRef(0);
    const searchJumpVersionRef = useRef(0);
    const messagesRef = useRef([]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const uploadInFlight = useRef(false);
    const historyRequestRef = useRef(0);
    const paginationRef = useRef({ friendId: null, nextPage: 0, hasMore: false, loading: false });

    // ConfirmDialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [confirmCallback, setConfirmCallback] = useState(null);

    const socket = useSocket();

    const {
        onTyping,
        onMessageEdited,
        onMessageDeleted
    } = socket;

    const { markConversationNotificationsRead } = useNotifications();

    useEffect(() => { loadChatSidebar(); }, []);
    useEffect(() => { selectedFriendRef.current = selectedFriend; }, [selectedFriend]);

    useEffect(() => {
        return () => {
            sendActiveConversation(null);
        };
    }, []);

    function setActiveChat(friendId) {
        whenSocketConnected(() => sendActiveConversation(friendId));
    }

    function closeConversation() {
        setActiveChat(null);
        setShowChat(false);
    }

    function openMessageSearch() {
        setMessageSearchOpen(true);
    }

    function closeMessageSearch() {
        searchRequestIdRef.current += 1;
        setMessageSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        setSearching(false);
        setSearchError(false);
        setResultsVisible(true);
        setActiveResultIndex(-1);
        setJumpLoading(false);
        triggerJump(null);
    }

    function resetMessageSearch() {
        closeMessageSearch();
    }

    function triggerJump(messageId) {
        searchJumpVersionRef.current += 1;
        setSearchJump({
            messageId,
            version: searchJumpVersionRef.current
        });
    }

    async function selectSearchResult(message, index) {
        if (!message) return;
        setResultsVisible(false);
        if (index != null) setActiveResultIndex(index);

        const isLoaded = () =>
            messagesRef.current.some(item => item.id === message.id);

        if (isLoaded()) {
            triggerJump(message.id);
            return;
        }

        // The match may live in history that has not been paginated in yet.
        // Reuse the existing incremental history loading until it appears.
        setJumpLoading(true);
        try {
            for (let attempt = 0; attempt < 150; attempt++) {
                if (isLoaded()) break;
                const pagination = paginationRef.current;
                if (!pagination.friendId || !pagination.hasMore) break;
                if (pagination.loading) {
                    await new Promise(resolve => setTimeout(resolve, 60));
                    continue;
                }
                await loadOlderMessages();
                await new Promise(resolve => setTimeout(resolve, 40));
            }
        } finally {
            setJumpLoading(false);
        }

        if (isLoaded()) {
            triggerJump(message.id);
        } else {
            toast.error("Couldn't locate that message.");
        }
    }

    function goToResult(index) {
        if (searchResults.length === 0) return;
        const total = searchResults.length;
        const wrapped = ((index % total) + total) % total;
        selectSearchResult(searchResults[wrapped], wrapped);
    }

    function goToNextResult() {
        goToResult(activeResultIndex < 0 ? 0 : activeResultIndex + 1);
    }

    function goToPrevResult() {
        goToResult(activeResultIndex < 0 ? -1 : activeResultIndex - 1);
    }

    // Debounced, conversation-scoped server search.
    useEffect(() => {
        if (!messageSearchOpen) return undefined;
        const friend = selectedFriendRef.current;
        if (!friend) return undefined;

        const trimmed = debouncedSearchQuery.trim();
        if (!trimmed) {
            searchRequestIdRef.current += 1;
            setSearching(false);
            setSearchError(false);
            setSearchResults([]);
            setActiveResultIndex(-1);
            setResultsVisible(true);
            return undefined;
        }

        const requestId = ++searchRequestIdRef.current;
        let cancelled = false;

        setSearching(true);
        setSearchError(false);

        (async () => {
            try {
                const response = await ChatService.searchMessages(friend.id, trimmed);
                if (
                    cancelled ||
                    requestId !== searchRequestIdRef.current ||
                    selectedFriendRef.current?.id !== friend.id
                ) return;
                const data = Array.isArray(response.data?.data) ? response.data.data : [];
                setSearchResults([...data].reverse());
                setActiveResultIndex(-1);
                setResultsVisible(true);
            } catch {
                if (cancelled || requestId !== searchRequestIdRef.current) return;
                setSearchError(true);
                setSearchResults([]);
                setActiveResultIndex(-1);
            } finally {
                if (!cancelled && requestId === searchRequestIdRef.current) {
                    setSearching(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [debouncedSearchQuery, messageSearchOpen, selectedFriend?.id]);
    
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
        if (!onMessageDeleted) return;
        const unsubscribe = onMessageDeleted(event => {
            setMessages(previous =>
                previous.map(message =>
                    message.id === event.messageId
                        ? {
                            ...message,
                            deletedForEveryone: true,
                            deletedAt: event.deletedAt
                        }
                        : message
                )
            );
        });
        return unsubscribe;
    }, [onMessageDeleted]);

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

            setFriends(previous => {
                return previous
                    .map(friend => {
                        const friendId =
                            incoming.senderId === myId
                                ? incoming.receiverId
                                : incoming.senderId;

                        if (friend.id !== friendId) {
                            return friend;
                        }

                        const opened =
                            selectedFriendRef.current?.id === friend.id;

                        return {
                            ...friend,
                            lastMessage:
                                incoming.messageType === "AUDIO_CALL" || incoming.messageType === "VIDEO_CALL"
                                    ?
                                    (incoming.messageType === "AUDIO_CALL" ? "📞 " : "📹 ") + (incoming.content || "")
                                    :
                                    incoming.content ||
                                    (
                                        incoming.attachmentMimeType?.startsWith("image/")
                                            ?
                                            "📷 Photo"
                                            :
                                        incoming.attachmentMimeType?.includes("pdf")
                                            ?
                                            "📄 PDF"
                                            :
                                        incoming.attachmentMimeType?.includes("video")
                                            ?
                                            "🎥 Video"
                                            :
                                        incoming.attachmentMimeType?.includes("audio")
                                            ?
                                            "🎵 Audio"
                                            :
                                        incoming.attachmentName ||
                                        "📎 Attachment"
                                    ),
                            lastMessageTime:
                                incoming.sentAt,
                            unreadCount:
                                incoming.receiverId === myId &&
                                !opened
                                    ?
                                    (friend.unreadCount || 0) + 1
                                    :
                                    0
                        };
                    })
                    .sort(
                        (a, b) =>
                            new Date(
                                b.lastMessageTime || 0
                            )
                            -
                            new Date(
                                a.lastMessageTime || 0
                            )
                    );
            });
        });
        const removeReceipt = socket.onReceipt(receipt =>
            setMessages(previous => previous.map(message =>
                message.id === receipt.messageId ? { ...message, status: receipt.status } : message
            ))
        );
        const removePresence = socket.onPresence(status => {
            setFriends(previous => previous.map(friend => friend.id === status.userId ? { ...friend, online: status.online, lastSeen: status.online ? friend.lastSeen : status.lastSeen } : friend));
            setSelectedFriend(previous => !previous || previous.id !== status.userId ? previous : { ...previous, online: status.online, lastSeen: status.online ? previous.lastSeen : status.lastSeen });
        });
        return () => { removeMessage(); removeReceipt(); removePresence(); };
    }, [socket]);

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
        resetMessageSearch();

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

    function handleForward(message) {
    setForwardingMessage(message);
}

    function resetAttachmentPreview() {
        setSelectedAttachment(null);
        setAttachmentCaption("");
        setAttachmentError("");
        setUploadProgress(0);
    }

    async function sendAttachment() {
        let optimisticId = null;
        if (
            !selectedAttachment ||
            !selectedFriend ||
            uploadInFlight.current
        ) {
            return;
        }

        uploadInFlight.current = true;

        setUploadingAttachment(true);
        setUploadProgress(0);
        setAttachmentError("");

        try {
            let uploadResponse;

            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    uploadResponse = await ChatService.uploadFile(
                        selectedAttachment,
                        percent => {
                            setUploadProgress(percent);
                        }
                    );
                    break;
                } catch (err) {
                    if (
                        attempt === 1 ||
                        err?.response?.status
                    ) {
                        throw err;
                    }
                }
            }

            const attachment = uploadResponse.data?.data ?? uploadResponse.data;
            const payload = {
                clientId: uuid(),
                receiverId: selectedFriend.id,
                content: attachmentCaption.trim(),
                attachmentUrl: attachment.attachmentUrl,
                attachmentName: attachment.attachmentName,
                attachmentSize: attachment.attachmentSize,
                attachmentMimeType: attachment.attachmentMimeType,
                messageType: attachment.attachmentMimeType?.startsWith("image/") ? "IMAGE" : "FILE",
                replyToId: replyingTo?.id
            };
            const optimistic = {
                id: payload.clientId,
                ...payload,
                senderId: Number(localStorage.getItem("userId")),
                status: "SENDING",
                sentAt: new Date().toISOString()
            };
            if (replyingTo) optimistic.reply = replyingTo;
            optimisticId = optimistic.id;
            setMessages(previous => [...previous, optimistic]);
            setScrollToBottomRequest(request => request + 1);
            await ChatService.sendMessage(payload);
            toast.success("Attachment sent");
            resetAttachmentPreview();
            setReplyingTo(null);

        } catch (err) {
            if (optimisticId) setMessages(previous => previous.filter(message => message.id !== optimisticId));
            console.error(err);
            const errorMessage =
                err?.response?.data?.message ||
                "Attachment upload failed.";
            setAttachmentError(errorMessage);
            toast.error(errorMessage);
        } finally {
            uploadInFlight.current = false;
            setUploadingAttachment(false);
        }
    }

    function resetVoicePreview() {
        setVoicePreview(null);
        setVoiceError("");
        setVoiceUploadProgress(0);
    }

    async function sendVoiceMessage() {
        if (
            !voicePreview ||
            !selectedFriend ||
            uploadInFlight.current
        ) {
            return;
        }

        uploadInFlight.current = true;

        setSendingVoice(true);
        setVoiceUploadProgress(0);
        setVoiceError("");

        let optimisticId = null;

        try {
            const uploadResponse = await ChatService.uploadFile(
                voicePreview.file,
                percent => {
                    setVoiceUploadProgress(percent);
                }
            );

            const attachment = uploadResponse.data?.data ?? uploadResponse.data;
            const payload = {
                clientId: uuid(),
                receiverId: selectedFriend.id,
                content: "",
                attachmentUrl: attachment.attachmentUrl,
                attachmentName: attachment.attachmentName,
                attachmentSize: attachment.attachmentSize,
                attachmentMimeType: attachment.attachmentMimeType,
                attachmentDuration: voicePreview.duration,
                messageType: "VOICE",
                replyToId: replyingTo?.id
            };
            const optimistic = {
                id: payload.clientId,
                ...payload,
                senderId: Number(localStorage.getItem("userId")),
                status: "SENDING",
                sentAt: new Date().toISOString()
            };
            if (replyingTo) optimistic.reply = replyingTo;
            optimisticId = optimistic.id;
            setMessages(previous => [...previous, optimistic]);
            setScrollToBottomRequest(request => request + 1);
            await ChatService.sendMessage(payload);
            toast.success("Voice message sent");
            resetVoicePreview();
            setReplyingTo(null);

        } catch (err) {
            if (optimisticId) setMessages(previous => previous.filter(message => message.id !== optimisticId));
            console.error(err);
            const errorMessage =
                err?.response?.data?.message ||
                "Voice message upload failed.";
            setVoiceError(errorMessage);
            toast.error(errorMessage);
        } finally {
            uploadInFlight.current = false;
            setSendingVoice(false);
        }
    }

    async function forwardMessage(message, friend) {

    if (!message || !friend || forwarding) {
        return;
    }

    setForwarding(true);

    try {

        await ChatService.forwardMessage(
            message.id,
            friend.id
        );

        toast.success(
            `Message forwarded to ${friend.fullName}`
        );

        setForwardingMessage(null);

    } catch (error) {

        console.error(
            "Forward message failed:",
            error
        );

        toast.error(
            error?.response?.data?.message ||
            "Couldn't forward the message."
        );

    } finally {

        setForwarding(false);

    }
}

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
                    setMessages(previous =>
                        previous.filter(
                            item => item.id !== message.id
                        )
                    );
                } catch (error) {
                    console.error(error);
                    toast.error("Couldn't delete the message.");
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
                            {messageSearchOpen ? (
                                <ChatSearchBar
                                    query={searchQuery}
                                    onQueryChange={setSearchQuery}
                                    onClose={closeMessageSearch}
                                    onNext={goToNextResult}
                                    onPrev={goToPrevResult}
                                    onToggleResults={() => setResultsVisible(visible => !visible)}
                                    resultsVisible={resultsVisible}
                                    results={searchResults}
                                    activeIndex={activeResultIndex}
                                    searching={searching}
                                    error={searchError}
                                    jumpLoading={jumpLoading}
                                />
                            ) : (
                                <ChatHeader friend={selectedFriend} onBack={closeConversation} onSearch={openMessageSearch} typing={
                                    selectedFriend
                                        ? typingUsers.has(selectedFriend.id)
                                        : false
                                }/>
                            )}
                            {messageSearchOpen && (
                                <ChatSearchResults
                                    results={searchResults}
                                    query={searchQuery}
                                    activeIndex={activeResultIndex}
                                    searching={searching}
                                    error={searchError}
                                    friend={selectedFriend}
                                    me={{
                                        id: Number(localStorage.getItem("userId")),
                                        name: user?.name,
                                        profilePicture: user?.profilePicture
                                    }}
                                    onSelect={selectSearchResult}
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
                                onForward={setForwardingMessage}
                                highlightQuery={searchQuery.trim()}
                                searchActive={messageSearchOpen}
                                scrollToMessageId={searchJump.messageId ?? null}
                                scrollToMessageVersion={searchJump.version}
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
                                    if (message.status === "SENDING") setScrollToBottomRequest(request => request + 1);
                                }}
                                onAttachmentSelected={(file) => {
                                    setSelectedAttachment(file);
                                    setAttachmentCaption("");
                                    setAttachmentError("");
                                    setUploadProgress(0);
                                }}
                                onVoiceRecorded={(file, duration) => {
                                    setVoicePreview({ file, duration });
                                    setVoiceError("");
                                    setVoiceUploadProgress(0);
                                }}
                            />
                        {selectedAttachment && (isImageAttachment({ attachmentMimeType: selectedAttachment.type }) ? (
                            <ImagePreviewModal image={selectedAttachment} caption={attachmentCaption} setCaption={setAttachmentCaption}
                                uploading={uploadingAttachment} progress={uploadProgress} error={attachmentError}
                                onCancel={resetAttachmentPreview} onSend={sendAttachment} />
                        ) : (
                            <FilePreviewModal file={selectedAttachment} caption={attachmentCaption} setCaption={setAttachmentCaption}
                                uploading={uploadingAttachment} progress={uploadProgress} error={attachmentError}
                                onCancel={resetAttachmentPreview} onSend={sendAttachment} />
                        ))}
                        {voicePreview && (
                            <VoicePreviewModal
                                file={voicePreview.file}
                                duration={voicePreview.duration}
                                uploading={sendingVoice}
                                progress={voiceUploadProgress}
                                error={voiceError}
                                onCancel={resetVoicePreview}
                                onSend={sendVoiceMessage}
                            />
                        )}
                    </>
                ) : <div className="chat-empty-state">
                    <div className="chat-empty-icon"><MessageCircleMore size={34}/></div>
                    <h2>Choose a conversation</h2>
                    <p>Select a friend to start chatting.</p>
                    <button type="button" className="chat-empty-cta" onClick={closeConversation}><Plus size={18}/>Start New Chat</button>
                </div>}
            </div>

            {forwardingMessage && (
    <ForwardMessageModal
        message={forwardingMessage}
        friends={friends}
        loading={forwarding}
        onClose={() => {
            if (!forwarding) {
                setForwardingMessage(null);
            }
        }}
        onForward={forwardMessage}
    />
)}

            <ConfirmDialog
                open={confirmOpen}
                title={confirmConfig?.title}
                message={confirmConfig?.message}
                confirmText={confirmConfig?.confirmText}
                cancelText={confirmConfig?.cancelText}
                confirmVariant={confirmConfig?.confirmVariant}
                onCancel={() => {
                    setConfirmOpen(false);
                }}
                onConfirm={async () => {
                    setConfirmOpen(false);
                    if (confirmCallback) {
                        await confirmCallback();
                    }
                }}
            />
        </div>
    );
}
