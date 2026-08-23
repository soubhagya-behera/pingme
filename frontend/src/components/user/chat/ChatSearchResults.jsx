import { SearchX } from "lucide-react";

import Avatar from "../../ui/Avatar";
import HighlightText from "./HighlightText";
import { attachmentLabel } from "./AttachmentUtils";

function resultPreview(message) {
    if (message.content && message.content.trim()) return message.content;
    return attachmentLabel(message);
}

function formatWhen(sentAt) {
    if (!sentAt) return "";
    const date = new Date(sentAt);
    const now = new Date();
    const time = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
    if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${time}`;
    }
    const day = date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
    return `${day}, ${time}`;
}

export default function ChatSearchResults({
    results,
    query,
    activeIndex,
    searching,
    error,
    friend,
    me,
    onSelect
}) {
    const trimmed = query.trim();
    const isMine = message => message.senderId === me?.id;

    return (
        <div
            className="chat-search-results-overlay"
            role="region"
            aria-label="Message search results"
        >
            {!trimmed ? null : error ? (
                <div className="chat-search-state">
                    <SearchX size={26} />
                    <p>Couldn't search messages. Please try again.</p>
                </div>
            ) : searching ? (
                <div className="chat-search-state">
                    <span className="chat-search-spinner" aria-hidden="true" />
                    <p>Searching…</p>
                </div>
            ) : results.length === 0 ? (
                <div className="chat-search-state">
                    <SearchX size={26} />
                    <p>No messages found</p>
                    <small>No matches for “{trimmed}” in this conversation.</small>
                </div>
            ) : (
                <>
                    <div className="chat-search-results-head">
                        {results.length} {results.length === 1 ? "result" : "results"}
                    </div>
                    <ul className="chat-search-results-list">
                        {results.map((message, index) => (
                            <li key={message.id}>
                                <button
                                    type="button"
                                    className={`chat-search-result-item ${
                                        index === activeIndex ? "is-active" : ""
                                    }`}
                                    onClick={() => onSelect(message, index)}
                                >
                                    <span className="chat-search-result-avatar">
                                        <Avatar
                                            name={
                                                isMine(message)
                                                    ? me?.name
                                                    : friend?.fullName
                                            }
                                            src={
                                                isMine(message)
                                                    ? me?.profilePicture
                                                    : friend?.profilePicture
                                            }
                                            size={36}
                                        />
                                    </span>
                                    <span className="chat-search-result-body">
                                        <span className="chat-search-result-top">
                                            <b>
                                                {isMine(message)
                                                    ? "You"
                                                    : friend?.fullName}
                                            </b>
                                            <time>
                                                {formatWhen(message.sentAt)}
                                            </time>
                                        </span>
                                        <span className="chat-search-result-snippet">
                                            <HighlightText
                                                text={resultPreview(message)}
                                                query={trimmed}
                                            />
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
