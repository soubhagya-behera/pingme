import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function ImageViewer({ src, alt = "Shared image", onClose }) {
    useEffect(() => {
        if (!src) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = event => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [src, onClose]);

    return <AnimatePresence>{src && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="chat-image-viewer"
        role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
        <button type="button" aria-label="Close image viewer" onClick={onClose}
            className="chat-image-viewer-close">
            <X size={24} />
        </button>
        <motion.img initial={{ scale: .96 }} animate={{ scale: 1 }} exit={{ scale: .96 }} transition={{ duration: .18 }}
            src={src} alt={alt} onClick={event => event.stopPropagation()} className="chat-image-viewer-content" />
    </motion.div>}</AnimatePresence>;
}
