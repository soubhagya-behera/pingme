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
import { MessageCircleMore, Plus } from "lucide-react";
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

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [confirmCallback, setConfirmCallback] = useState(null);

    const { user } = useAuth();
    const socket = useSocket();
    const { markConversationNotificationsRead } = useNotifications();
    const messagesRef = useRef([]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { selectedFriendRef.current = selectedFriend; }, [selectedFriend]);
    useEffect(() => { return () => { sendActiveConversation(null); }; }, []);

    const {
        loadChatSidebar,
        selectFriend: rawSelectFriend,
        loadOlderMessages,
        closeConversation,
        paginationRef,
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
        rawSelectFriend(friend);
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
                        {search.messageSearchOpen ? (
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
                            <ChatHeader friend={selectedFriend} onBack={closeConversation} onSearch={search.openMessageSearch} typing={selectedFriend ? typingUsers.has(selectedFriend.id) : false} />
                        )}
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
                                if (message.status === "SENDING") setScrollToBottomRequest(r => r + 1);
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
