import { createContext, useContext, useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, onSocketConnected } from "../websocket/socket";
import { subscribeMessages, subscribePresence, subscribeMessageStatus, subscribeTyping, subscribeMessageEdited, subscribeMessageDeleted, subscribeNotifications } from "../websocket/subscriptions";
import { acknowledgeDelivery, announceSocketReady } from "../websocket/publisher";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { token } = useAuth();
    const messageListeners = useRef(new Set());
    const receiptListeners = useRef(new Set());
    const presenceListeners = useRef(new Set());
    const typingListeners = useRef(new Set());
    const messageEditedListeners = useRef(new Set());
    const messageDeletedListeners = useRef(new Set());
    const notificationListeners = useRef(new Set());

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        let messageSubscription;
        let presenceSubscription;
        let receiptSubscription;
        let typingSubscription;
        let messageEditedSubscription;
        let messageDeletedSubscription;
        let notificationSubscription;
        let removeReconnectListener;

        const subscribeToSocketEvents = () => {
            if (cancelled) return;

            // A STOMP reconnect creates a new server session, so its
            // subscriptions must be registered again for every connection.
            messageSubscription?.unsubscribe();
            receiptSubscription?.unsubscribe();
            presenceSubscription?.unsubscribe();
            typingSubscription?.unsubscribe();
            messageEditedSubscription?.unsubscribe();
            messageDeletedSubscription?.unsubscribe();
            notificationSubscription?.unsubscribe();

            // These subscriptions are application-wide: delivery cannot depend on Chat being mounted.
            messageSubscription = subscribeMessages(message => {
                const myId = Number(localStorage.getItem("userId"));
                if (message.receiverId === myId) acknowledgeDelivery(message.id);
                messageListeners.current.forEach(listener => listener(message));
            });
            receiptSubscription = subscribeMessageStatus(receipt =>
                receiptListeners.current.forEach(listener => listener(receipt))
            );
            presenceSubscription = subscribePresence(presence =>
                presenceListeners.current.forEach(listener => listener(presence))
            );

            typingSubscription = subscribeTyping(
                typing =>
                    typingListeners.current.forEach(
                        listener => listener(typing)
                    )
            );

            messageEditedSubscription = subscribeMessageEdited(
                edited =>
                    messageEditedListeners.current.forEach(
                        listener => listener(edited)
                    )
            );

            messageDeletedSubscription = subscribeMessageDeleted(
                deleted =>
                    messageDeletedListeners.current.forEach(
                        listener => listener(deleted)
                    )
            );

            notificationSubscription = subscribeNotifications(
                notification =>
                    notificationListeners.current.forEach(
                        listener => listener(notification)
                    )
            );

            // Sent after all inbox subscriptions exist, so reconnects replay unacknowledged messages safely.
            announceSocketReady();
        };

        removeReconnectListener = onSocketConnected(subscribeToSocketEvents);
        connectSocket(token);

        return () => {
            cancelled = true;
            messageSubscription?.unsubscribe();
            receiptSubscription?.unsubscribe();
            presenceSubscription?.unsubscribe();
            typingSubscription?.unsubscribe();
            messageEditedSubscription?.unsubscribe();
            messageDeletedSubscription?.unsubscribe();
            notificationSubscription?.unsubscribe();
            removeReconnectListener?.();
            disconnectSocket();
        };
    }, [token]);

    const value = {
        onMessage: listener => {
            messageListeners.current.add(listener);
            return () =>
                messageListeners.current.delete(listener);
        },
        onReceipt: listener => {
            receiptListeners.current.add(listener);
            return () =>
                receiptListeners.current.delete(listener);
        },
        onPresence: listener => {
            presenceListeners.current.add(listener);
            return () =>
                presenceListeners.current.delete(listener);
        },
        onTyping: listener => {
            typingListeners.current.add(listener);
            return () =>
                typingListeners.current.delete(listener);
        },
        onMessageEdited: listener => {
            messageEditedListeners.current.add(listener);
            return () =>
                messageEditedListeners.current.delete(listener);
        },
        onMessageDeleted: listener => {
            messageDeletedListeners.current.add(listener);
            return () =>
                messageDeletedListeners.current.delete(listener);
        },
        onNotification: listener => {
            notificationListeners.current.add(listener);
            return () =>
                notificationListeners.current.delete(listener);
        }
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() { return useContext(SocketContext); }
