import { useState } from "react";
import MessageActionsMenu from "./MessageActionsMenu";
import ImageViewer from "./ImageViewer";
import AttachmentCard from "./AttachmentCard";
import { attachmentLabel, attachmentUrl, isImageAttachment } from "./AttachmentUtils";

export default function MessageBubble({ message, mine, text, time, status, onReply, onEdit, onDelete, onDeleteMe }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const isImage = isImageAttachment(message);
  const imageSrc = attachmentUrl(message.attachmentUrl);
  const ticks = !mine ? null : status === "SENDING" ? "⌛" : status === "FAILED" ? "!" : status === "SENT" ? "✓" : status === "DELIVERED" ? "✓✓" : status === "READ" ? <span className="chat-read-receipt">✓✓</span> : null;
  const replyText = message.reply?.content || (message.reply?.attachmentUrl ? attachmentLabel(message.reply) : "Message");
  return <div className={`chat-message-row ${mine ? "is-mine" : ""}`}>
    {!mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe}/>}<div className={`chat-bubble ${mine ? "is-mine" : ""}`}>
      {!message.deletedForEveryone && message.reply && <div className="chat-reply-preview"><b>Reply</b><span>{replyText}</span></div>}
      {message.deletedForEveryone ? <span className="chat-deleted-message">🗑 This message was deleted</span> : <>
        {isImage && imageSrc && <button type="button" onClick={() => setViewerOpen(true)} className="chat-image-button"><img src={imageSrc} alt={message.attachmentName || "Shared image"} loading="lazy" /></button>}
        {!isImage && message.attachmentUrl && <AttachmentCard attachment={message} />}
        {message.content && <p>{text}</p>}
      </>}
      <div className="chat-message-meta">{message.edited && !message.deletedForEveryone && <span>edited</span>}{time && new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{ticks}</div>
    </div>{mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe}/>}<ImageViewer src={viewerOpen ? imageSrc : null} alt={message.attachmentName || "Shared image"} onClose={() => setViewerOpen(false)} />
  </div>;
}
