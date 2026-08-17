import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    CheckCheck,
    UserPlus,
    UserCheck,
    MessageCircle,
    PhoneMissed,
    Inbox
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/NotificationContext";

function timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function typeIcon(type) {
    if (type === "NEW_FRIEND_REQUEST") return UserPlus;
    if (type === "FRIEND_REQUEST_ACCEPTED") return UserCheck;
    if (type === "MISSED_CALL") return PhoneMissed;
    return MessageCircle;
}

function typeColor(type) {
    if (type === "NEW_FRIEND_REQUEST") return "text-orange-500 bg-orange-500/10";
    if (type === "FRIEND_REQUEST_ACCEPTED") return "text-emerald-500 bg-emerald-500/10";
    if (type === "MISSED_CALL") return "text-rose-500 bg-rose-500/10";
    return "text-indigo-500 bg-indigo-500/10";
}

export default function NotificationBell() {
    const {
        notifications,
        unreadCount,
        markRead,
        markAllRead
    } = useNotifications();

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = event => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function handleNotificationClick(notification) {
        setOpen(false);
        if (!notification.read) {
            markRead(notification.id);
        }

        if (notification.type === "NEW_MESSAGE") {
            navigate("/chat", {
                state: {
                    openFriendId: notification.relatedUserId
                }
            });
        } else if (notification.type === "NEW_FRIEND_REQUEST") {
            navigate("/requests");
        } else if (notification.type === "FRIEND_REQUEST_ACCEPTED") {
            navigate("/friends");
        } else if (notification.type === "MISSED_CALL") {
            navigate("/chat", {
                state: {
                    openFriendId: notification.relatedUserId
                }
            });
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label="Notifications"
                className="relative rounded-xl p-2 text-[var(--text)] transition-colors hover:bg-[var(--card-secondary)]"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
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
                        className="absolute right-0 z-50 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                            <h3 className="text-sm font-bold text-[var(--text)]">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                                >
                                    <CheckCheck size={14} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[24rem] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-4 py-10 text-[var(--text-secondary)]">
                                    <Inbox size={28} />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notification => {
                                    const Icon = typeIcon(notification.type);
                                    const unread = !notification.read;
                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() =>
                                                handleNotificationClick(notification)
                                            }
                                            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--card-secondary)] ${
                                                unread
                                                    ? "bg-[var(--card-secondary)]/60"
                                                    : ""
                                            }`}
                                        >
                                            <span
                                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeColor(
                                                    notification.type
                                                )}`}
                                            >
                                                <Icon size={18} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center justify-between gap-2">
                                                    <span className="truncate text-sm font-semibold text-[var(--text)]">
                                                        {notification.title}
                                                    </span>
                                                    <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                                                        {timeAgo(
                                                            notification.createdAt
                                                        )}
                                                    </span>
                                                </span>
                                                <span className="mt-0.5 block truncate text-sm text-[var(--text-secondary)]">
                                                    {notification.message}
                                                </span>
                                            </span>
                                            {unread && (
                                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                                            )}
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