import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { Image as ImageIcon, LoaderCircle, Reply, Send, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
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
            toast.success("Image sent");
            cancelImage(); clearReply?.();
        } catch (error) { 
            console.error(error);
            toast.error(uploadError(error));
            setImageError(uploadError(error)); 
        }
        finally { uploadInFlight.current = false; setUploading(false); }
    }
    async function send() {
        if (!friend || !message.trim() || uploading) return;
        if (editingMessage) { 
            try { 
                await ChatService.editMessage(editingMessage.id, message); 
                toast.success("Message edited");
                setMessage(""); 
                clearEditing?.(); 
            } catch (error) { 
                console.error(error);
                toast.error("Couldn't edit the message.");
                setImageError(uploadError(error)); 
            } 
            return; 
        }
        const content = message.trim(); setMessage(""); stopTyping();
        try { await addAfterSend({ clientId: uuid(), receiverId: friend.id, content, messageType: "TEXT", replyToId: replyingTo?.id }); clearReply?.(); }
        catch (error) { setMessage(content); setImageError(uploadError(error)); }
    }
    return <div className="chat-input-area">
        {imageError && !selectedImage && <p role="alert" className="chat-input-error">{imageError}</p>}
        {editingMessage && <div className="chat-input-context is-editing"><span>Editing message</span><button type="button" onClick={() => { clearEditing?.(); setMessage(""); }} aria-label="Cancel editing"><X size={18}/></button></div>}
        {replyingTo && <div className="chat-input-context"><span><Reply size={16}/>Replying to {replyingTo.content || (replyingTo.imageUrl ? "a photo" : "a message")}</span><button type="button" onClick={clearReply} aria-label="Cancel reply"><X size={18}/></button></div>}
        {showEmojiPicker && <div ref={pickerRef} className="chat-emoji-picker"><EmojiPicker onEmojiClick={({ emoji }) => handleTyping(message + emoji)} width={320} height={380}/></div>}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={chooseImage}/>
        <div className="chat-input-row"><button type="button" onClick={() => setShowEmojiPicker(v => !v)} className="chat-input-icon-button" aria-label="Choose emoji"><Smile size={21}/></button><button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="chat-input-icon-button" aria-label="Choose image"><ImageIcon size={21}/></button>
            <input ref={inputRef} value={message} disabled={uploading} onChange={e => handleTyping(e.target.value)} placeholder="Type a message..." className="chat-message-field" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}/>
            <button type="button" disabled={uploading || !message.trim()} onClick={send} className="chat-send-button" aria-label="Send message">{uploading ? <LoaderCircle className="animate-spin" size={18}/> : <Send size={18}/>}</button></div>
        <ImagePreviewModal image={selectedImage} caption={caption} setCaption={setCaption} onCancel={cancelImage} onSend={sendImage} uploading={uploading} progress={progress} error={imageError}/>
    </div>;
}
