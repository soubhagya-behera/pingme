import { useEffect, useMemo } from "react";
import { LoaderCircle, Send, X } from "lucide-react";

export default function ImagePreviewModal({ image, caption, setCaption, onCancel, onSend, uploading, progress, error }) {
    const previewUrl = useMemo(() => image ? URL.createObjectURL(image) : null, [image]);
    useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);
    useEffect(() => {
        if (!image) return;
        const oldOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = oldOverflow; };
    }, [image]);
    if (!image) return null;
    return <div className="chat-image-preview-modal" role="dialog" aria-modal="true" aria-label="Send image">
        <header className="chat-image-preview-header"><h2>Send image</h2>
            <button type="button" disabled={uploading} onClick={onCancel} aria-label="Cancel image" className="chat-image-preview-cancel"><X /></button></header>
        <div className="chat-image-preview-stage"><img src={previewUrl} alt="Image preview" /></div>
        <footer className="chat-image-preview-footer">
            <input value={caption} disabled={uploading} maxLength={4000} onChange={event => setCaption(event.target.value)} placeholder="Add a caption..." />
            {error && <p role="alert" className="chat-input-error">{error}</p>}
            <div className="chat-image-preview-actions"><span>{uploading ? `Uploading ${progress}%` : image.name}</span>
                <button type="button" disabled={uploading} onClick={onSend} aria-label="Send image" className="chat-send-button">
                    {uploading ? <LoaderCircle className="animate-spin" size={19} /> : <Send size={19} />}
                </button></div>
        </footer>
    </div>;
}
