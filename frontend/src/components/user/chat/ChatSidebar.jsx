import { Search } from "lucide-react";

export default function ChatSidebar({ selectedFriend, onSelect, friends }) {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-top">
        <div className="chat-sidebar-title-row">
          <div>
            <span className="chat-sidebar-eyebrow">MESSAGES</span>
            <h2>Chats</h2>
          </div>
          <span className="chat-count">{friends.length}</span>
        </div>
        <label className="chat-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search conversations"
            aria-label="Search conversations"
          />
        </label>
      </div>
      <div className="chat-conversation-list">
        {friends.map(friend => (
          <button
            key={friend.id}
            type="button"
            onClick={() => onSelect(friend)}
            className={`chat-conversation-item ${
              selectedFriend?.id === friend.id ? "is-selected" : ""
            }`}
          >
            <span className="chat-avatar-wrap">
              <span className="chat-avatar">
                {friend.fullName.charAt(0)}
              </span>
              {friend.online && <span className="chat-online-dot" />}
            </span>
            <span className="chat-conversation-copy">
              <span className="chat-conversation-top">
                <b>{friend.fullName}</b>
                <time>
                  {friend.lastMessageTime
                    ? new Date(friend.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : ""}
                </time>
              </span>
              <div className="chat-conversation-bottom">
                <span className="chat-conversation-preview">
                  {friend.lastMessage || "Start conversation"}
                </span>
                {friend.unreadCount > 0 && (
                  <span className="chat-unread-badge">
                    {friend.unreadCount}
                  </span>
                )}
              </div>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}