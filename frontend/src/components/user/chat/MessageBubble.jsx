import { useState } from "react";
import MessageActionsMenu from "./MessageActionsMenu";
import ImageViewer from "./ImageViewer";
import AttachmentCard from "./AttachmentCard";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import CallHistoryMessage from "./CallHistoryMessage";
import { attachmentLabel, attachmentUrl, isImageAttachment, isVoiceMessage } from "./AttachmentUtils";

export default function MessageBubble({ message, mine, text, time, status, onReply, onEdit, onDelete, onDeleteMe, onForward }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const isCallHistory = message.messageType === "AUDIO_CALL" || message.messageType === "VIDEO_CALL";
  if (isCallHistory) {
    return <div className="chat-message-row is-call-history"><CallHistoryMessage message={message} /></div>;
  }
  const isImage = isImageAttachment(message);
  const isVoice = isVoiceMessage(message);
  const imageSrc = attachmentUrl(message.attachmentUrl);
  const ticks = !mine ? null : status === "SENDING" ? "⌛" : status === "FAILED" ? "!" : status === "SENT" ? "✓" : status === "DELIVERED" ? "✓✓" : status === "READ" ? <span className="chat-read-receipt">✓✓</span> : null;
  const replyText = message.reply?.content || (message.reply?.attachmentUrl ? attachmentLabel(message.reply) : "Message");
  
  return <div className={`chat-message-row ${mine ? "is-mine" : ""}`}>
    {!mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe} onForward={onForward} />}
    <div className={`chat-bubble ${mine ? "is-mine" : ""}`}>
      {!message.deletedForEveryone && message.reply && <div className="chat-reply-preview"><b>Reply</b><span>{replyText}</span></div>}
      {message.deletedForEveryone ? <span className="chat-deleted-message">🗑 This message was deleted</span> : <>
        {isVoice && message.attachmentUrl ? <VoiceMessagePlayer src={attachmentUrl(message.attachmentUrl)} duration={message.attachmentDuration} mine={mine} /> : <>
          {isImage && imageSrc && <button type="button" onClick={() => setViewerOpen(true)} className="chat-image-button"><img src={imageSrc} alt={message.attachmentName || "Shared image"} loading="lazy" /></button>}
          {!isImage && message.attachmentUrl && <AttachmentCard attachment={message} />}
        </>}
        {message.content && <p>{text}</p>}
      </>}
      <div className="chat-message-meta">{message.edited && !message.deletedForEveryone && <span>edited</span>}{time && new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{ticks}</div>
    </div>
    {mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe} onForward={onForward} />}
    <ImageViewer src={viewerOpen ? imageSrc : null} alt={message.attachmentName || "Shared image"} onClose={() => setViewerOpen(false)} />
  </div>;
}