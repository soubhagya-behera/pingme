import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";

export default function ImageViewer({ src, alt = "Shared image", onClose }) {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    if (!src) return undefined;
    setZoom(1);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = event => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [src, onClose]);
  const changeZoom = amount => setZoom(value => Math.min(3, Math.max(0.5, Number((value + amount).toFixed(1)))));
  return <AnimatePresence>{src && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="chat-image-viewer" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
    <div className="chat-image-viewer-toolbar" onClick={event => event.stopPropagation()}><button type="button" aria-label="Zoom out" onClick={() => changeZoom(-0.25)}><Minus size={20} /></button><span>{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom in" onClick={() => changeZoom(0.25)}><Plus size={20} /></button></div>
    <button type="button" aria-label="Close image viewer" onClick={onClose} className="chat-image-viewer-close"><X size={24} /></button>
    <motion.img initial={{ scale: .96 }} animate={{ scale: zoom }} exit={{ scale: .96 }} transition={{ duration: .18 }} src={src} alt={alt} onWheel={event => { event.preventDefault(); changeZoom(event.deltaY < 0 ? 0.15 : -0.15); }} onClick={event => event.stopPropagation()} className="chat-image-viewer-content" />
  </motion.div>}</AnimatePresence>;
}
