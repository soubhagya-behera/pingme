import toast from "react-hot-toast";
import { ChevronDown, Reply, Pencil, Trash2, Copy, Forward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EDIT_WINDOW_MS, DELETE_WINDOW_MS } from "../../../constants/chatConstants";

export default function MessageActionsMenu({ mine, onReply, onEdit, onDelete, onDeleteMe, onForward, message }) {
  const [open, setOpen] = useState(false); const menuRef = useRef(null);
  const isVoice = message.messageType === "VOICE" || message.attachmentMimeType?.startsWith("audio/");
  const canEdit = mine && !message.deletedForEveryone && !isVoice && Date.now() - new Date(message.sentAt).getTime() < EDIT_WINDOW_MS;
  const canDeleteForEveryone = mine && !message.deletedForEveryone && Date.now() - new Date(message.sentAt).getTime() < DELETE_WINDOW_MS;
  useEffect(() => { const outside = event => menuRef.current && !menuRef.current.contains(event.target) && setOpen(false); document.addEventListener("mousedown", outside); return () => document.removeEventListener("mousedown", outside); }, []);
  const item = (label, icon, action, danger = false) => <button type="button" className={`chat-message-action-item ${danger ? "is-danger" : ""}`} onClick={() => { action(); setOpen(false); }}>{icon}{label}</button>;
  return <div ref={menuRef} className="chat-message-actions"><button type="button" onClick={() => setOpen(value => !value)} className="chat-message-actions-toggle" aria-label="Message actions"><ChevronDown size={18}/></button>{open && <div className={`chat-message-actions-menu ${mine ? "is-mine" : ""}`}>
    {!message.deletedForEveryone && item("Reply", <Reply size={17}/>, () => onReply(message))}
    {canEdit && item("Edit", <Pencil size={17}/>, () => onEdit(message))}
    {!message.deletedForEveryone && !isVoice && item("Copy", <Copy size={17}/>, () => { navigator.clipboard.writeText(message.content); toast.success("Copied to clipboard"); })}
    {canDeleteForEveryone && item("Delete for Everyone", <Trash2 size={17}/>, () => onDelete(message), true)}
    {!message.deletedForEveryone && item("Delete for Me", <Trash2 size={17}/>, () => onDeleteMe(message))}
    {!message.deletedForEveryone && item("Forward", <Forward size={17}/>, () => onForward(message))}
  </div>}</div>;
}