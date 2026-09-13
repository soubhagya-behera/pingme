import { useEffect } from "react";
import { acknowledgeRead } from "../../../../websocket/publisher";
import { removePending, getAllHistoryCacheForOwner, setHistoryCacheForOwner } from "../../../../offline/db";

function getOwnerId() {
  try {
    const v = localStorage.getItem("userId");
    if (v && v !== "null" && v !== "undefined") return Number(v);
  } catch {}
  try {
    const raw = localStorage.getItem("user");
    if (raw) { const u = JSON.parse(raw); if (u?.id != null) return Number(u.id); }
  } catch {}
  return null;
}

export default function useChatSocket({
    socket,
    selectedFriendRef,
    setMessages,
    setFriends,
    setSelectedFriend,
    setTypingUsers,
}) {
    useEffect(() => {
        if (!socket?.onTyping) return;
        const unsubscribe = socket.onTyping(event => {
            // H2 FIX: typer identity is senderId. Keep receiverId fallback for backward compat with older backend.
            const typerId = event.senderId ?? event.receiverId;
            if (typerId == null) return;
            const id = Number(typerId);
            setTypingUsers(prev => {
                const copy = new Set(prev);
                if (event.typing) {
                    copy.add(id);
                } else {
                    copy.delete(id);
                }
                return copy;
            });
        });
        return unsubscribe;
    }, [socket, setTypingUsers]);

    useEffect(() => {
        if (!socket?.onMessageEdited) return;
        const unsubscribe = socket.onMessageEdited(event => {
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
    }, [socket, setMessages]);

    useEffect(() => {
        if (!socket?.onMessageDeleted) return;
        const unsubscribe = socket.onMessageDeleted(event => {
            setMessages(previous =>
                previous.filter(message => message.id !== event.messageId)
            );
            // Evict from history cache as well so offline refresh doesn't resurrect — scoped to current owner
            const ownerId = getOwnerId();
            if (ownerId != null) {
              getAllHistoryCacheForOwner(ownerId).then(caches => {
                  (caches||[]).forEach(c => {
                      if (c.messages?.some(m=> m.id===event.messageId)) {
                          const filtered = c.messages.filter(m=> m.id!==event.messageId);
                          setHistoryCacheForOwner(ownerId, c.friendId, { ...c, messages: filtered }).catch(()=>{});
                      }
                  });
              }).catch(()=>{});
            }
            removePending(String(event.messageId)).catch(()=>{});
        });
        return unsubscribe;
    }, [socket, setMessages]);

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
                    const next = [...previous]; next[optimisticIndex] = incoming;
                    // Clean IndexedDB outbox if this was a pending offline message
                    if (incoming.clientId) { removePending(incoming.clientId).catch(()=>{}); }
                    return next;
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
    }, [socket, selectedFriendRef, setMessages, setFriends, setSelectedFriend]);
}
