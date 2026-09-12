import { Download, ExternalLink } from "lucide-react";
import FileIcon from "./FileIcon";
import { attachmentLabel, formatFileSize } from "./AttachmentUtils";
import { useSecureMedia } from "../../../hooks/useSecureMedia";

export default function AttachmentCard({ attachment }) {
  // Authenticated blob URL so open/download work without leaking the private link.
  const url = useSecureMedia(attachment.attachmentUrl);
  const name = attachment.attachmentName || attachmentLabel(attachment);
  return <div className="chat-attachment-card">
    <span className="chat-attachment-icon"><FileIcon attachment={attachment} /></span>
    <span className="chat-attachment-copy"><b title={name}>{name}</b><small>{attachmentLabel(attachment)}{attachment.attachmentSize ? ` · ${formatFileSize(attachment.attachmentSize)}` : ""}</small></span>
    <span className="chat-attachment-actions">
      <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${name}`} title="Open"><ExternalLink size={17} /></a>
      <a href={url} download={attachment.attachmentName || true} aria-label={`Download ${name}`} title="Download"><Download size={17} /></a>
    </span>
  </div>;
}
