import { useState } from "react";
import MessageActionsMenu from "./MessageActionsMenu";
import ImageViewer from "./ImageViewer";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8080";
export default function MessageBubble({ message, mine, text, time, status, onReply, onEdit, onDelete, onDeleteMe }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const imageSrc = message.imageUrl?.startsWith("http") ? message.imageUrl : `${API_ORIGIN}${message.imageUrl ?? ""}`;
  const ticks = !mine ? null : status === "SENDING" ? "⌛" : status === "SENT" ? "✓" : status === "DELIVERED" ? "✓✓" : status === "READ" ? <span className="chat-read-receipt">✓✓</span> : null;
  return <div className={`chat-message-row ${mine ? "is-mine" : ""}`}>
    {!mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe}/>}<div className={`chat-bubble ${mine ? "is-mine" : ""}`}>
      {!message.deletedForEveryone && message.reply && <div className="chat-reply-preview"><b>Reply</b><span>{message.reply.content || (message.reply.imageUrl ? "Photo" : "Message")}</span></div>}
      {message.deletedForEveryone ? <span className="chat-deleted-message">🗑 This message was deleted</span> : <>{message.messageType === "IMAGE" && message.imageUrl && <button type="button" onClick={() => setViewerOpen(true)} className="chat-image-button"><img src={imageSrc} alt="Shared image" loading="lazy"/></button>}{message.content && <p>{text}</p>}</>}
      <div className="chat-message-meta">{message.edited && !message.deletedForEveryone && <span>edited</span>}{time && new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{ticks}</div>
    </div>{mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe}/>}<ImageViewer src={viewerOpen ? imageSrc : null} onClose={() => setViewerOpen(false)}/>
  </div>;
}
