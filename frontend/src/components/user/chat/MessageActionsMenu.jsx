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
    const GAP = 8; const PADDING = 8;
    const compute = () => {
      const btn = buttonRef.current; const menu = dropdownRef.current;
      if (!btn || !menu) return;
      const btnRect = btn.getBoundingClientRect();
      const container = btn.closest(".chat-messages");
      const containerRect = container ? container.getBoundingClientRect() : { left: PADDING, right: window.innerWidth - PADDING, top: PADDING, bottom: window.innerHeight - PADDING, width: window.innerWidth, height: window.innerHeight };
      const menuW = menu.offsetWidth || 208;
      const menuH = menu.offsetHeight || 220;
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;

      const spaceBelow = Math.min(containerRect.bottom - btnRect.bottom - GAP, vpH - btnRect.bottom - GAP);
      const spaceAbove = Math.min(btnRect.top - containerRect.top - GAP, btnRect.top - GAP);
      const canBelow = spaceBelow >= menuH + PADDING;
      const canAbove = spaceAbove >= menuH + PADDING;
      let placeBelow;
      if (canBelow) placeBelow = true;
      else if (canAbove) placeBelow = false;
      else placeBelow = spaceBelow > spaceAbove;

      let top = placeBelow ? btnRect.bottom + GAP : btnRect.top - menuH - GAP;

      const minTop = Math.max(containerRect.top + PADDING, PADDING);
      const maxTop = Math.min(containerRect.bottom - menuH - PADDING, vpH - menuH - PADDING);
      top = Math.max(minTop, Math.min(top, maxTop));

      let left;
      if (mine) {
        left = btnRect.left;
      } else {
        left = btnRect.right - menuW;
      }
      const minLeft = Math.max(containerRect.left + PADDING, PADDING);
      const maxLeft = Math.min(containerRect.right - menuW - PADDING, vpW - menuW - PADDING);
      left = Math.max(minLeft, Math.min(left, maxLeft));

      let maxH; let overflowY;
      if (placeBelow) {
        const availBelow = Math.min(containerRect.bottom - top - PADDING, vpH - top - PADDING);
        if (availBelow < menuH) { maxH = Math.max(120, availBelow); overflowY = "auto"; }
      } else {
        const availAbove = top - Math.max(containerRect.top, 0) - PADDING;
        if (availAbove < 0) { maxH = Math.max(120, menuH + availAbove); overflowY = "auto"; }
      }

      setPlacement(placeBelow ? "below" : "above");
      setMenuStyle({
        position: "fixed",
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        right: "auto",
        bottom: "auto",
        zIndex: 50,
        maxHeight: maxH ? `${Math.round(maxH)}px` : undefined,
        overflowY,
        transform: "none",
        transition: "none",
        animation: "none",
      });
    };
    compute();
    const raf = requestAnimationFrame(() => requestAnimationFrame(compute));
    const handleResize = () => compute();
    const handleScrollClose = () => setOpen(false);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScrollClose, true);
    const containerEl = buttonRef.current?.closest(".chat-messages");
    containerEl?.addEventListener("scroll", handleScrollClose, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScrollClose, true);
      containerEl?.removeEventListener("scroll", handleScrollClose);
    };
  }, [open, mine, canEdit, canDeleteForEveryone, isVoice, message.deletedForEveryone]);

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