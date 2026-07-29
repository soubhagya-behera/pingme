import { ArrowLeft, MoreVertical, Phone, Search, Video } from "lucide-react";

export default function ChatHeader({ friend, onBack, typing }) {
  const presence = typing ? "Typing…" : friend.online ? "Online now" : "Last seen recently";
  return <header className="chat-header">
    <div className="chat-header-person"><button type="button" onClick={onBack} className="chat-header-back" aria-label="Back to conversations"><ArrowLeft size={21}/></button><span className="chat-avatar-wrap"><span className="chat-avatar">{friend.fullName.charAt(0)}</span>{friend.online && <span className="chat-online-dot" />}</span><div><h2>{friend.fullName}</h2><p className={typing ? "is-typing" : ""}>{presence}</p></div></div>
    <div className="chat-header-actions"><button type="button" aria-label="Start voice call"><Phone size={18}/></button><button type="button" aria-label="Start video call"><Video size={18}/></button><button type="button" aria-label="Search conversation"><Search size={18}/></button><button type="button" aria-label="More options"><MoreVertical size={19}/></button></div>
  </header>;
}
