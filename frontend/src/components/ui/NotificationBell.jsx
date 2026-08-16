import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Inbox, UserCheck, UserPlus } from "lucide-react";
import NotificationService from "../../services/NotificationService";
import { subscribeNotifications } from "../../websocket/subscriptions";
import { whenSocketConnected } from "../../websocket/socket";

function formatRelativeTime(value) {
    if (!value) return "";

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric"
    });
}

function notificationIcon(type) {
    return type === "FRIEND_REQUEST_ACCEPTED" ? UserCheck : UserPlus;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef();

    useEffect(() => {
        const handler = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);

        return () =>
            document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        loadNotifications();

        let subscription;

        whenSocketConnected(() => {
            subscription = subscribeNotifications(() => {
                loadNotifications();
            });
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    async function loadNotifications() {
        try {
            const [listResponse, countResponse] = await Promise.all([
                NotificationService.getNotifications(),
                NotificationService.getUnreadCount()
            ]);
            setNotifications(listResponse.data.data);
            setUnreadCount(countResponse.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    function toggleOpen() {
        const next = !open;
        setOpen(next);
        if (next) loadNotifications();
    }

    async function handleNotificationClick(notification) {
        if (notification.read) return;

        try {
            await NotificationService.markAsRead(notification.id);
        } catch (error) {
            console.log(error);
            return;
        }

        setNotifications(previous =>
            previous.map(item =>
                item.id === notification.id
                    ? { ...item, read: true }
                    : item
            )
        );
        setUnreadCount(count => Math.max(0, count - 1));
    }

    async function handleMarkAllRead() {
        if (unreadCount === 0) return;

        try {
            await NotificationService.markAllAsRead();
        } catch (error) {
            console.log(error);
            return;
        }

        setNotifications(previous =>
            previous.map(item => ({ ...item, read: true }))
        );
        setUnreadCount(0);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleOpen}
                aria-label="Notifications"
                className="relative rounded-xl border border-[var(--border)] p-2 transition hover:bg-[var(--card-secondary)]"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                            <h3 className="font-bold">Notifications</h3>
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                disabled={unreadCount === 0}
                                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)] disabled:opacity-50"
                            >
                                <CheckCheck size={14} />
                                Mark all as read
                            </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto p-2">
                            {notifications.length === 0 ? (
                                <div className="px-6 py-10 text-center">
                                    <Inbox
                                        size={36}
                                        className="mx-auto text-[var(--text-secondary)] opacity-60"
                                    />
                                    <p className="mt-3 font-semibold">
                                        No notifications
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        You're all caught up.
                                    </p>
                                </div>
                            ) : (
                                notifications.map(notification => {
                                    const Icon = notificationIcon(notification.type);
                                    const unread = !notification.read;

                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() =>
                                                handleNotificationClick(notification)
                                            }
                                            className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--card-secondary)] ${
                                                unread
                                                    ? "bg-[var(--row-selected)]"
                                                    : ""
                                            }`}
                                        >
                                            <span
                                                className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                                                    unread
                                                        ? "bg-indigo-100 text-indigo-600"
                                                        : "bg-[var(--card-secondary)] text-[var(--text-secondary)]"
                                                }`}
                                            >
                                                <Icon size={16} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-semibold">
                                                        {notification.title}
                                                    </span>
                                                    {unread && (
                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                                                    )}
                                                </span>
                                                <span className="mt-0.5 block truncate text-xs text-[var(--text-secondary)]">
                                                    {notification.message}
                                                </span>
                                                <span className="mt-1 block text-[11px] text-[var(--text-secondary)] opacity-80">
                                                    {formatRelativeTime(
                                                        notification.createdAt
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}