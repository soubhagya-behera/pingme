import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import ChatSidebar from "../../../components/user/chat/ChatSidebar";
import ChatHeader from "../../../components/user/chat/ChatHeader";
import ChatMessages from "../../../components/user/chat/ChatMessages";
import ChatInput from "../../../components/user/chat/ChatInput";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import ChatService from "../../../services/ChatService";
import { acknowledgeRead } from "../../../websocket/publisher";
import { useSocket } from "../../../context/SocketProvider";
import { MessageCircleMore, Plus } from "lucide-react";
import "../../../styles/user/chat/chat.css";
import ImagePreviewModal from "../../../components/user/chat/ImagePreviewModal";
import FilePreviewModal from "../../../components/user/chat/FilePreviewModal";
import { isImageAttachment } from "../../../components/user/chat/AttachmentUtils";
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
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [forwardingMessage, setForwardingMessage] = useState(null);

    const [attachmentCaption, setAttachmentCaption] = useState("");
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [attachmentError, setAttachmentError] = useState("");

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

    useEffect(() => { loadChatSidebar(); }, []);
    useEffect(() => { selectedFriendRef.current = selectedFriend; }, [selectedFriend]);
    
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
            setFriends(previous => previous.map(friend => friend.id === status.userId ? { ...friend, online: status.online } : friend));
            setSelectedFriend(previous => !previous || previous.id !== status.userId ? previous : { ...previous, online: status.online });
        });
        return () => { removeMessage(); removeReceipt(); removePresence(); };
    }, [socket]);

    async function loadChatSidebar() {
        try { setFriends((await ChatService.getChatSidebar()).data.data); }
        catch { setFriends([]); }
        finally { setLoading(false); }
    }

    async function selectFriend(friend) {
        const requestId = ++historyRequestRef.current;
        selectedFriendRef.current = friend;
        setSelectedFriend(friend);
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
                            <ChatHeader friend={selectedFriend} onBack={() => setShowChat(false)} typing={
                                selectedFriend
                                    ? typingUsers.has(selectedFriend.id)
                                    : false
                            }/>
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
                                onForward={handleForward}
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
                    </>
                ) : <div className="chat-empty-state">
                    <div className="chat-empty-icon"><MessageCircleMore size={34}/></div>
                    <h2>Choose a conversation</h2>
                    <p>Select a friend to start chatting.</p>
                    <button type="button" className="chat-empty-cta" onClick={() => setShowChat(false)}><Plus size={18}/>Start New Chat</button>
                </div>}
            </div>

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
