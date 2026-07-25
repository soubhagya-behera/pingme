import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { Image as ImageIcon, LoaderCircle, Reply, Send, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import ChatService from "../../../services/ChatService";
import { sendStopTyping, sendTyping } from "../../../websocket/publisher";
import ImagePreviewModal from "./ImagePreviewModal";

const uploadError = error => error?.response?.data?.message || (error?.code === "ECONNABORTED" ? "Upload timed out. Please try again." : "Image upload failed. Check your connection and try again.");
export default function ChatInput({ friend, replyingTo, clearReply, editingMessage, clearEditing, onMessageSent }) {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [imageError, setImageError] = useState("");
    const inputRef = useRef(null), fileInputRef = useRef(null), pickerRef = useRef(null), typingRef = useRef(false), typingTimeout = useRef(null), uploadInFlight = useRef(false);

    useEffect(() => { if (editingMessage) { setMessage(editingMessage.content ?? ""); requestAnimationFrame(() => inputRef.current?.focus()); } }, [editingMessage]);
    useEffect(() => {
        const close = event => pickerRef.current && !pickerRef.current.contains(event.target) && setShowEmojiPicker(false);
        document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close);
    }, []);
    useEffect(() => () => { if (typingTimeout.current) clearTimeout(typingTimeout.current); }, []);

    const stopTyping = () => { if (typingRef.current && friend) { typingRef.current = false; clearTimeout(typingTimeout.current); sendStopTyping(friend.id); } };
    function handleTyping(value) { setMessage(value); if (!friend) return; if (!typingRef.current) { typingRef.current = true; sendTyping(friend.id); } clearTimeout(typingTimeout.current); typingTimeout.current = setTimeout(stopTyping, 1500); }
    function chooseImage(event) { const file = event.target.files?.[0]; if (!file || uploading) return; setSelectedImage(file); setCaption(""); setImageError(""); }
    function cancelImage() { if (uploading) return; setSelectedImage(null); setCaption(""); setImageError(""); setProgress(0); if (fileInputRef.current) fileInputRef.current.value = ""; }
    const addAfterSend = async payload => {
        await ChatService.sendMessage(payload);
        onMessageSent({ id: payload.clientId, ...payload, senderId: Number(localStorage.getItem("userId")), status: "SENDING", sentAt: new Date().toISOString() });
    };
    async function sendImage() {
        if (!selectedImage || !friend || uploadInFlight.current) return;
        const image = selectedImage, messageCaption = caption, receiverId = friend.id, replyToId = replyingTo?.id;
        uploadInFlight.current = true; setUploading(true); setProgress(0); setImageError("");
        try {
            let response;
            for (let attempt = 0; attempt < 2; attempt += 1) {
                try { response = await ChatService.uploadImage(image, setProgress); break; }
                catch (error) { if (attempt === 1 || error?.response?.status) throw error; }
            }
            const clientId = uuid();
            await addAfterSend({ clientId, receiverId, content: messageCaption, imageUrl: response.data.data.imageUrl, messageType: "IMAGE", replyToId });
            cancelImage(); clearReply?.();
        } catch (error) { setImageError(uploadError(error)); }
        finally { uploadInFlight.current = false; setUploading(false); }
    }
    async function send() {
        if (!friend || !message.trim() || uploading) return;
        if (editingMessage) { try { await ChatService.editMessage(editingMessage.id, message); setMessage(""); clearEditing?.(); } catch (error) { setImageError(uploadError(error)); } return; }
        const content = message.trim(); setMessage(""); stopTyping();
        try { await addAfterSend({ clientId: uuid(), receiverId: friend.id, content, messageType: "TEXT", replyToId: replyingTo?.id }); clearReply?.(); }
        catch (error) { setMessage(content); setImageError(uploadError(error)); }
    }
    return <div className="relative border-t bg-white px-3 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4">
        {imageError && !selectedImage && <p role="alert" className="mb-2 text-sm text-red-600">{imageError}</p>}
        {editingMessage && <div className="mb-2 flex justify-between rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm"><span>Editing message</span><button onClick={() => { clearEditing?.(); setMessage(""); }}><X size={18}/></button></div>}
        {replyingTo && <div className="mb-2 flex justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm"><span className="truncate"><Reply size={16} className="mr-1 inline"/>Replying to {replyingTo.content || (replyingTo.imageUrl ? "a photo" : "a message")}</span><button onClick={clearReply}><X size={18}/></button></div>}
        {showEmojiPicker && <div ref={pickerRef} className="absolute bottom-20 left-2 z-50 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl shadow-2xl"><EmojiPicker onEmojiClick={({ emoji }) => handleTyping(message + emoji)} width={320} height={380}/></div>}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={chooseImage}/>
        <div className="flex items-center gap-1.5 sm:gap-3"><button type="button" onClick={() => setShowEmojiPicker(v => !v)} className="rounded-full p-3 text-slate-500 hover:text-indigo-600" aria-label="Choose emoji"><Smile size={22}/></button><button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="rounded-full p-3 text-slate-500 hover:text-indigo-600 disabled:opacity-50" aria-label="Choose image"><ImageIcon size={22}/></button>
            <input ref={inputRef} value={message} disabled={uploading} onChange={e => handleTyping(e.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}/>
            <button type="button" disabled={uploading || !message.trim()} onClick={send} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50" aria-label="Send message">{uploading ? <LoaderCircle className="animate-spin" size={18}/> : <Send size={18}/>}</button></div>
        <ImagePreviewModal image={selectedImage} caption={caption} setCaption={setCaption} onCancel={cancelImage} onSend={sendImage} uploading={uploading} progress={progress} error={imageError}/>
    </div>;
}
