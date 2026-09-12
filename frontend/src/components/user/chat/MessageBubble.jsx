import { useState } from "react";
import MessageActionsMenu from "./MessageActionsMenu";
import ImageViewer from "./ImageViewer";
import AttachmentCard from "./AttachmentCard";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import CallHistoryMessage from "./CallHistoryMessage";
import HighlightText from "./HighlightText";
import { attachmentLabel, isImageAttachment, isVoiceMessage } from "./AttachmentUtils";
import { useSecureMedia } from "../../../hooks/useSecureMedia";

export default function MessageBubble({ message, mine, text, time, status, onReply, onEdit, onDelete, onDeleteMe, onForward, isHighlighted = false, highlightQuery = "", selectionMode = false, isSelected = false, onToggleSelect = null }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const imageSrc = useSecureMedia(message?.attachmentUrl);
  const isCallHistory = message.messageType === "AUDIO_CALL" || message.messageType === "VIDEO_CALL";
  if (isCallHistory) {
    if (selectionMode) {
      return (
        <div className={`chat-message-row is-call-history ${selectionMode ? "is-select-mode" : ""} ${isSelected ? "is-selected" : ""}`} data-message-id={message.id} onClick={() => onToggleSelect?.(message.id)} role="button" aria-selected={isSelected} tabIndex={0}>
          {selectionMode && (
            <span className="chat-select-indicator" aria-hidden="true">
              <span className={`chat-select-circle ${isSelected ? "is-checked" : ""}`}>
                {isSelected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L4.8 8.3L9.5 3.7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
            </span>
          )}
          <CallHistoryMessage message={message} />
        </div>
      );
    }
    return <div className="chat-message-row is-call-history" data-message-id={message.id}><CallHistoryMessage message={message} /></div>;
  }
  const isImage = isImageAttachment(message);
  const isVoice = isVoiceMessage(message);
  const ticks = !mine ? null : status === "PENDING" ? <span title="Waiting for connection" className="chat-pending-dot">○</span> : status === "SYNCING" ? <span className="chat-pending-dot is-syncing">◐</span> : status === "SENDING" ? "⌛" : status === "FAILED" ? "!" : status === "SENT" ? "✓" : status === "DELIVERED" ? "✓✓" : status === "READ" ? <span className="chat-read-receipt">✓✓</span> : null;
  const replyText = message.reply?.content || (message.reply?.attachmentUrl ? attachmentLabel(message.reply) : "Message");
  
  const handleSelectClick = (e) => {
    if (!selectionMode) return;
    // Don't toggle when interacting with inner controls (links, buttons) — let those handle separately
    // For audio/files, allow bubble click to toggle, but inner button clicks shouldn't double-toggle
    if (e.target.closest('a, button')) {
      // If the click was on the image viewer button or audio button, still toggle selection but avoid duplicate handling
      // For now, toggle anyway unless it's a dedicated control that stops propagation
    }
    onToggleSelect?.(message.id);
  };

  return <div className={`chat-message-row ${mine ? "is-mine" : ""} ${isHighlighted ? "is-highlighted" : ""} ${selectionMode ? "is-select-mode" : ""} ${isSelected ? "is-selected" : ""}`} data-message-id={message.id} onClick={selectionMode ? handleSelectClick : undefined} role={selectionMode ? "button" : undefined} aria-selected={selectionMode ? isSelected : undefined} tabIndex={selectionMode ? 0 : undefined} onKeyDown={selectionMode ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleSelect?.(message.id); } } : undefined}>
    {selectionMode && (
      <span className="chat-select-indicator" aria-hidden="true">
        <span className={`chat-select-circle ${isSelected ? "is-checked" : ""}`}>
          {isSelected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L4.8 8.3L9.5 3.7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
      </span>
    )}
    <div className={`chat-bubble ${mine ? "is-mine" : ""} ${isSelected ? "is-selected" : ""}`}>
      {!selectionMode && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe} onForward={onForward} />}
      {message.reply && <div className="chat-reply-preview"><b>Reply</b><span>{replyText}</span></div>}
      {isVoice && message.attachmentUrl ? (
        selectionMode ? (
          <div style={{ pointerEvents: 'none' }}><VoiceMessagePlayer src={message.attachmentUrl} duration={message.attachmentDuration} mine={mine} /></div>
        ) : (
          <VoiceMessagePlayer src={message.attachmentUrl} duration={message.attachmentDuration} mine={mine} />
        )
      ) : <>
        {isImage && imageSrc && <button type="button" onClick={(e) => { if (selectionMode) { e.stopPropagation(); onToggleSelect?.(message.id); return; } setViewerOpen(true); }} className="chat-image-button"><img src={imageSrc} alt={message.attachmentName || "Shared image"} loading="lazy" /></button>}
        {!isImage && message.attachmentUrl && <AttachmentCard attachment={message} />}
      </>}
      {message.content && <p><HighlightText text={text} query={highlightQuery} /></p>}
      <div className="chat-message-meta">{message.edited && <span>edited</span>}{time && new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{ticks}</div>
    </div>
    <ImageViewer src={viewerOpen ? imageSrc : null} alt={message.attachmentName || "Shared image"} onClose={() => setViewerOpen(false)} />
  </div>;
}