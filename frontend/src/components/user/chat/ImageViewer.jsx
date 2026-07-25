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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-[max(1rem,env(safe-area-inset-top))]"
        role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
        <button type="button" aria-label="Close image viewer" onClick={onClose}
            className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] rounded-full bg-white/15 p-3 text-white hover:bg-white/25">
            <X size={24} />
        </button>
        <motion.img initial={{ scale: .96 }} animate={{ scale: 1 }} exit={{ scale: .96 }} transition={{ duration: .18 }}
            src={src} alt={alt} onClick={event => event.stopPropagation()} className="max-h-[88dvh] max-w-full select-none object-contain" />
    </motion.div>}</AnimatePresence>;
}
