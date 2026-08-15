import { useMemo, useState } from "react";
import { Search, X, Forward } from "lucide-react";
import "../../../styles/user/chat/forward-message.css";

export default function ForwardMessageModal({
    message,
    friends,
    onClose,
    onForward,
    loading = false
}) {

    const [search, setSearch] = useState("");
    const [selectedFriend, setSelectedFriend] = useState(null);

    const filteredFriends = useMemo(() => {

        const query = search.trim().toLowerCase();

        if (!query) {
            return friends;
        }

        return friends.filter(friend =>
            friend.fullName
                ?.toLowerCase()
                .includes(query)
        );

    }, [friends, search]);

    function handleForward() {

        if (!selectedFriend || loading) {
            return;
        }

        onForward(
            message,
            selectedFriend
        );
    }

    function getPreview() {

        if (message?.content) {
            return message.content;
        }

        if (
            message?.attachmentMimeType
                ?.startsWith("image/")
        ) {
            return "📷 Photo";
        }

        if (
            message?.attachmentMimeType ===
            "application/pdf"
        ) {
            return "📄 PDF";
        }

        if (
            message?.attachmentName
        ) {
            return `📎 ${message.attachmentName}`;
        }

        return "📎 Attachment";
    }

    return (
        <div
            className="chat-forward-overlay"
            onMouseDown={event => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div className="chat-forward-modal">

                <div className="chat-forward-header">

                    <div>
                        <h3>
                            Forward message
                        </h3>

                        <p>
                            Select a conversation
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="chat-forward-close"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                </div>


                <div className="chat-forward-preview">

                    <span className="chat-forward-preview-icon">
                        <Forward size={18} />
                    </span>

                    <span>
                        {getPreview()}
                    </span>

                </div>


                <label className="chat-forward-search">

                    <Search size={18} />

                    <input
                        type="search"
                        value={search}
                        onChange={event =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search conversations"
                        autoFocus
                    />

                </label>


                <div className="chat-forward-list">

                    {filteredFriends.length === 0 ? (

                        <div className="chat-forward-empty">
                            No conversations found.
                        </div>

                    ) : (

                        filteredFriends.map(friend => {

                            const selected =
                                selectedFriend?.id === friend.id;

                            return (
                                <button
                                    key={friend.id}
                                    type="button"
                                    className={`chat-forward-friend ${
                                        selected
                                            ? "is-selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedFriend(friend)
                                    }
                                >

                                    <span className="chat-forward-avatar">

                                        {friend.fullName
                                            ?.charAt(0)
                                            ?.toUpperCase()}

                                        {friend.online && (
                                            <span className="chat-forward-online" />
                                        )}

                                    </span>


                                    <span className="chat-forward-friend-info">

                                        <strong>
                                            {friend.fullName}
                                        </strong>

                                        <small>
                                            {friend.online
                                                ? "Online"
                                                : "Offline"}
                                        </small>

                                    </span>


                                    <span className="chat-forward-radio">

                                        {selected && "✓"}

                                    </span>

                                </button>
                            );

                        })

                    )}

                </div>


                <div className="chat-forward-footer">

                    <button
                        type="button"
                        className="chat-forward-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="chat-forward-submit"
                        disabled={
                            !selectedFriend ||
                            loading
                        }
                        onClick={handleForward}
                    >

                        <Forward size={17} />

                        {loading
                            ? "Forwarding..."
                            : "Forward"}

                    </button>

                </div>

            </div>

        </div>
    );
}