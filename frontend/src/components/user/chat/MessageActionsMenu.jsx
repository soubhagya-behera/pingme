import toast from "react-hot-toast";
import { ChevronDown, Reply, Pencil, Trash2, Copy, Forward } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EDIT_WINDOW_MS, DELETE_WINDOW_MS } from "../../../constants/chatConstants";

export default function MessageActionsMenu({ mine, onReply, onEdit, onDelete, onDeleteMe, onForward, message }) {
  const [open, setOpen] = useState(false); const menuRef = useRef(null);
  const buttonRef = useRef(null); const dropdownRef = useRef(null);
  const [placement, setPlacement] = useState("below");
  const [menuStyle, setMenuStyle] = useState({});
  const isVoice = message.messageType === "VOICE" || message.attachmentMimeType?.startsWith("audio/");
  const canEdit = mine && !message.deletedForEveryone && !isVoice && Date.now() - new Date(message.sentAt).getTime() < EDIT_WINDOW_MS;
  const canDeleteForEveryone = mine && !message.deletedForEveryone && Date.now() - new Date(message.sentAt).getTime() < DELETE_WINDOW_MS;
  useEffect(() => { const outside = event => menuRef.current && !menuRef.current.contains(event.target) && setOpen(false); document.addEventListener("mousedown", outside); return () => document.removeEventListener("mousedown", outside); }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const GAP = 6; const VIEWPORT_PADDING = 8;
    const computePlacement = () => {
      const btn = buttonRef.current; const menu = dropdownRef.current;
      if (!btn || !menu) return;
      // The chat scroll container is the visible viewport for messages
      const container = btn.closest(".chat-messages");
      if (!container) {
        // fallback to viewport if container not found
        const btnRect = btn.getBoundingClientRect();
        const menuH = menu.offsetHeight || 220;
        const spaceBelowVP = window.innerHeight - btnRect.bottom - GAP;
        const spaceAboveVP = btnRect.top - GAP;
        const canBelow = spaceBelowVP >= menuH + VIEWPORT_PADDING;
        const canAbove = spaceAboveVP >= menuH + VIEWPORT_PADDING;
        let dir = "below";
        if (canBelow) dir = "below";
        else if (canAbove) dir = "above";
        else dir = spaceBelowVP > spaceAboveVP ? "below" : "above";
        setPlacement(dir);
        const avail = dir === "below" ? spaceBelowVP : spaceAboveVP;
        if (avail < menuH) setMenuStyle({ maxHeight: Math.max(120, avail - VIEWPORT_PADDING) + "px", overflowY: "auto" });
        else setMenuStyle({});
        return;
      }
      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const menuH = menu.offsetHeight || 220;
      const spaceBelow = containerRect.bottom - btnRect.bottom - GAP;
      const spaceAbove = btnRect.top - containerRect.top - GAP;
      const canBelow = spaceBelow >= menuH + VIEWPORT_PADDING;
      const canAbove = spaceAbove >= menuH + VIEWPORT_PADDING;
      let dir;
      if (canBelow) dir = "below";
      else if (canAbove) dir = "above";
      else dir = spaceBelow > spaceAbove ? "below" : "above";
      setPlacement(dir);
      const avail = dir === "below" ? spaceBelow : spaceAbove;
      if (avail < menuH) {
        setMenuStyle({ maxHeight: Math.max(120, avail - VIEWPORT_PADDING) + "px", overflowY: "auto" });
      } else {
        setMenuStyle({});
      }
    };
    // Initial compute after paint (menu has been rendered)
    const raf1 = requestAnimationFrame(() => {
      computePlacement();
      // Second frame ensures offsetHeight is stable after style updates
      requestAnimationFrame(computePlacement);
    });
    const onResize = () => computePlacement();
    const container = buttonRef.current?.closest(".chat-messages");
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    container?.addEventListener("scroll", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      container?.removeEventListener("scroll", onResize);
    };
  }, [open, canEdit, canDeleteForEveryone, isVoice, message.deletedForEveryone]);

  const item = (label, icon, action, danger = false) => <button type="button" className={`chat-message-action-item ${danger ? "is-danger" : ""}`} onClick={() => { action(); setOpen(false); }}>{icon}{label}</button>;
  return <div ref={menuRef} className="chat-message-actions"><button ref={buttonRef} type="button" onClick={() => setOpen(value => !value)} className="chat-message-actions-toggle" aria-label="Message actions"><ChevronDown size={18}/></button>{open && <div ref={dropdownRef} style={menuStyle} className={`chat-message-actions-menu ${mine ? "is-mine" : ""} ${placement === "below" ? "is-below" : "is-above"}`}>
    {!message.deletedForEveryone && item("Reply", <Reply size={17}/>, () => onReply(message))}
    {canEdit && item("Edit", <Pencil size={17}/>, () => onEdit(message))}
    {!message.deletedForEveryone && !isVoice && item("Copy", <Copy size={17}/>, () => { navigator.clipboard.writeText(message.content); toast.success("Copied to clipboard"); })}
    {canDeleteForEveryone && item("Delete for Everyone", <Trash2 size={17}/>, () => onDelete(message), true)}
    {!message.deletedForEveryone && item("Delete for Me", <Trash2 size={17}/>, () => onDeleteMe(message))}
    {!message.deletedForEveryone && item("Forward", <Forward size={17}/>, () => onForward(message))}
  </div>}</div>;
}