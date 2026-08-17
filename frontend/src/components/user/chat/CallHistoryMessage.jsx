import { Phone, Video } from "lucide-react";
import "../../../styles/user/chat/call-history.css";

function formatCallTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    if (date.toDateString() === now.toDateString()) {
        return `Today, ${time}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${time}`;
    }

    const day = date.toLocaleDateString([], {
        month: "short",
        day: "numeric"
    });
    return `${day}, ${time}`;
}

export default function CallHistoryMessage({ message }) {
    const isVideo = message.messageType === "VIDEO_CALL";

    return (
        <div className={`call-history ${isVideo ? "is-video" : ""}`}>
            <span className="call-history-icon">
                {isVideo ? <Video size={14} /> : <Phone size={14} />}
            </span>
            <span className="call-history-copy">
                <span className="call-history-text">{message.content}</span>
                <time className="call-history-time">{formatCallTime(message.sentAt)}</time>
            </span>
        </div>
    );
}