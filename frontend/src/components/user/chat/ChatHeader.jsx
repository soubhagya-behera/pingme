import { ArrowLeft, MoreVertical, Phone, Search, Video } from "lucide-react";
import Avatar from "../../ui/Avatar";
import { useCall } from "../../../context/CallContext";
import { useEffect, useRef, useState } from "react";

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "Offline";

  const date = new Date(lastSeen);
  const now = new Date();

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  if (date.toDateString() === now.toDateString()) {
    return `Last seen today at ${time}`;
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Last seen yesterday at ${time}`;
  }

  const day = date.toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });

  return `Last seen on ${day} at ${time}`;
}

export default function ChatHeader({ friend, onBack, typing, onSearch, onClearChat, onSelectMessages }) {
  const { startCall } = useCall();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  useEffect(() => {
    if (!moreOpen) return;
    const handleOutside = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    const handleEsc = (e) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => { document.removeEventListener("mousedown", handleOutside); document.removeEventListener("keydown", handleEsc); };
  }, [moreOpen]);
  const presence = typing ? "Typing…" : friend.online ? "Online" : formatLastSeen(friend.lastSeen);
  return <header className="chat-header">
    <div className="chat-header-person"><button type="button" onClick={onBack} className="chat-header-back" aria-label="Back to conversations"><ArrowLeft size={21}/></button><span className="chat-avatar-wrap"><span className="chat-avatar"><Avatar name={friend.fullName} src={friend.profilePicture} fill /></span>{friend.online && <span className="chat-online-dot" />}</span><div><h2>{friend.fullName}</h2><p className={typing ? "is-typing" : ""}>{presence}</p></div></div>
    <div className="chat-header-actions"><button type="button" aria-label="Start voice call" onClick={() => startCall(friend, "VOICE")}><Phone size={18}/></button><button type="button" aria-label="Start video call" onClick={() => startCall(friend, "VIDEO")}><Video size={18}/></button><button type="button" aria-label="Search messages in this conversation" title="Search messages" onClick={onSearch}><Search size={18}/></button><div ref={moreRef} className="chat-header-more-wrap"><button type="button" aria-label="More options" aria-expanded={moreOpen} onClick={() => setMoreOpen(v => !v)}><MoreVertical size={19}/></button>{moreOpen && <div className="chat-header-more-menu" role="menu"><button type="button" className="chat-header-more-item" role="menuitem" onClick={() => { setMoreOpen(false); onSelectMessages?.(); }}>Select Messages</button><button type="button" className="chat-header-more-item" role="menuitem" onClick={() => { setMoreOpen(false); onClearChat?.(); }}>Clear Chat</button></div>}</div></div>
  </header>;
}