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
    return <div className="fixed inset-0 z-[90] flex flex-col bg-white pt-[env(safe-area-inset-top)]" role="dialog" aria-modal="true" aria-label="Send image">
        <header className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Send image</h2>
            <button type="button" disabled={uploading} onClick={onCancel} aria-label="Cancel image" className="rounded-full p-3 text-slate-600 disabled:opacity-40"><X /></button></header>
        <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-950 p-3"><img src={previewUrl} alt="Image preview" className="max-h-full max-w-full rounded-lg object-contain" /></div>
        <footer className="border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <input value={caption} disabled={uploading} maxLength={4000} onChange={event => setCaption(event.target.value)} placeholder="Add a caption..." className="w-full rounded-xl border px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300" />
            {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-500">{uploading ? `Uploading ${progress}%` : image.name}</span>
                <button type="button" disabled={uploading} onClick={onSend} aria-label="Send image" className="flex h-12 min-w-12 items-center justify-center rounded-full bg-indigo-600 px-3 text-white disabled:opacity-60">
                    {uploading ? <LoaderCircle className="animate-spin" size={19} /> : <Send size={19} />}
                </button></div>
        </footer>
    </div>;
}
