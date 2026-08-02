import { useEffect } from "react";
import { LoaderCircle, Send, X } from "lucide-react";
import FileIcon from "./FileIcon";
import { attachmentLabel, formatFileSize } from "./AttachmentUtils";

export default function FilePreviewModal({ file, caption, setCaption, onCancel, onSend, uploading, progress, error }) {
  useEffect(() => {
    const onKeyDown = event => event.key === "Escape" && !uploading && onCancel();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [uploading, onCancel]);
  if (!file) return null;
  const attachment = { attachmentName: file.name, attachmentSize: file.size, attachmentMimeType: file.type };
  const extension = file.name.includes(".") ? file.name.split(".").pop().toUpperCase() : "FILE";
  return <div className="chat-image-preview-modal chat-file-preview-modal" role="dialog" aria-modal="true" aria-label="Send file">
    <header className="chat-image-preview-header"><h2>Send file</h2><button type="button" disabled={uploading} onClick={onCancel} aria-label="Cancel file" className="chat-image-preview-cancel"><X /></button></header>
    <div className="chat-file-preview-stage"><span className="chat-file-preview-icon"><FileIcon attachment={attachment} size={54} /></span><h3>{file.name}</h3><p>{extension} · {formatFileSize(file.size)} · {attachmentLabel(attachment)}</p></div>
    <footer className="chat-image-preview-footer"><input value={caption} disabled={uploading} maxLength={4000} onChange={event => setCaption(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !uploading) { event.preventDefault(); onSend(); } }} placeholder="Add a caption..." />
      {error && <p role="alert" className="chat-input-error">{error}</p>}
      <div className="chat-image-preview-actions"><span>{uploading ? `Uploading ${progress}%` : file.name}</span><button type="button" disabled={uploading} onClick={onSend} aria-label="Send file" className="chat-send-button">{uploading ? <LoaderCircle className="animate-spin" size={19} /> : <Send size={19} />}</button></div>
    </footer>
  </div>;
}
