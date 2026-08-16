import { useEffect, useMemo } from "react";
import { LoaderCircle, Send, Trash2, X } from "lucide-react";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import { formatDuration } from "./AttachmentUtils";

export default function VoicePreviewModal({ file, duration, onCancel, onSend, uploading, progress, error }) {
    const previewUrl = useMemo(
        () => (file ? URL.createObjectURL(file) : null),
        [file]
    );

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        const onKeyDown = event => event.key === "Escape" && !uploading && onCancel();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [uploading, onCancel]);

    if (!file) return null;

    return (
        <div className="chat-image-preview-modal chat-voice-preview-modal" role="dialog" aria-modal="true" aria-label="Send voice message">
            <header className="chat-image-preview-header">
                <h2>Send voice message</h2>
                <button type="button" disabled={uploading} onClick={onCancel} aria-label="Cancel voice message" className="chat-image-preview-cancel"><X /></button>
            </header>
            <div className="chat-voice-preview-stage">
                <VoiceMessagePlayer src={previewUrl} duration={duration} />
                <p className="chat-voice-preview-duration">{formatDuration(duration)}</p>
            </div>
            <footer className="chat-image-preview-footer">
                {error && <p role="alert" className="chat-input-error">{error}</p>}
                <div className="chat-image-preview-actions">
                    <span>{uploading ? `Uploading ${progress}%` : formatDuration(duration)}</span>
                    <div className="chat-voice-preview-buttons">
                        <button type="button" disabled={uploading} onClick={onCancel} aria-label="Delete recording" title="Delete recording" className="chat-voice-preview-delete"><Trash2 size={18} /></button>
                        <button type="button" disabled={uploading} onClick={onSend} aria-label="Send voice message" className="chat-send-button">
                            {uploading ? <LoaderCircle className="animate-spin" size={19} /> : <Send size={19} />}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}