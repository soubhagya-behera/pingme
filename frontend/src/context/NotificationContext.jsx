import { createContext, useContext, useEffect, useState, useCallback } from "react";
import NotificationService from "../services/NotificationService";
import { useSocket } from "./SocketProvider";
import { useAuth } from "./AuthContext";
import { onSocketConnected } from "../websocket/socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const socket = useSocket();

    const loadAll = useCallback(async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                NotificationService.getNotifications(),
                NotificationService.getUnreadCount()
            ]);
            setNotifications(listRes.data?.data ?? []);
            setUnreadCount(Number(countRes.data?.data ?? 0));
        } catch {
            // Notifications are best-effort; the bell must never break the app.
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        loadAll();
    }, [user?.id, loadAll]);

    useEffect(() => {
        if (!socket?.onNotification) return;
        const remove = socket.onNotification(notification => {
            setNotifications(prev => [
                notification,
                ...prev.filter(item => item.id !== notification.id)
            ]);
            if (!notification.read) {
                setUnreadCount(prev => prev + 1);
            }
        });
        return remove;
    }, [socket]);

    // Reconnect creates a fresh server session, so persisted notifications
    // (e.g. missed calls created while this client was offline) must be
    // re-fetched to stay in sync with the database.
    useEffect(() => {
        if (!user?.id) return;
        const remove = onSocketConnected(() => loadAll());
        return remove;
    }, [user?.id, loadAll]);

    const markRead = useCallback(async id => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        try {
            await NotificationService.markAsRead(id);
        } catch {
            // Revert nothing; the local optimistic update is still correct.
        }
    }, []);

    const markAllRead = useCallback(async () => {
        const hadUnread = unreadCount > 0;
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
        if (!hadUnread) return;
        try {
            await NotificationService.markAllRead();
        } catch {
            // Optimistic state remains correct in memory.
        }
    }, [unreadCount]);

    const markConversationNotificationsRead = useCallback(async friendId => {
        const ids = notifications
            .filter(notification =>
                notification.type === "NEW_MESSAGE" &&
                !notification.read &&
                notification.relatedUserId === friendId
            )
            .map(notification => notification.id);
        if (!ids.length) return;
        await Promise.all(ids.map(id => markRead(id)));
    }, [notifications, markRead]);

    const value = {
        notifications,
        unreadCount,
        loadAll,
        markRead,
        markAllRead,
        markConversationNotificationsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}