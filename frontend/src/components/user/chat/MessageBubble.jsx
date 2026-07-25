import { useState } from "react";
import MessageActionsMenu from "./MessageActionsMenu";
import ImageViewer from "./ImageViewer";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8080";
export default function MessageBubble({ message, mine, text, time, status, onReply, onEdit, onDelete, onDeleteMe }) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const imageSrc = message.imageUrl?.startsWith("http") ? message.imageUrl : `${API_ORIGIN}${message.imageUrl ?? ""}`;
    const ticks = !mine ? null : status === "SENDING" ? "⌛" : status === "SENT" ? "✓" : status === "DELIVERED" ? "✓✓" : status === "READ" ? <span className="text-sky-300">✓✓</span> : null;
    return <div className={`group flex items-start gap-1 ${mine ? "justify-end" : "justify-start"}`}>
        {!mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe} />}
        <div className={`max-w-[88%] sm:max-w-[70%] rounded-3xl px-3 py-2 ${mine ? "bg-indigo-600 text-white" : "bg-slate-200 text-black"}`}>
            {!message.deletedForEveryone && message.reply && <div className={`mb-2 rounded-xl border-l-4 px-3 py-2 ${mine ? "border-indigo-200 bg-indigo-500" : "border-indigo-500 bg-slate-300"}`}><p className="text-xs font-semibold">Reply</p><p className="truncate text-sm">{message.reply.content || (message.reply.imageUrl ? "Photo" : "Message")}</p></div>}
            {message.deletedForEveryone ? <span className="italic opacity-75">🗑 This message was deleted</span> : <>
                {message.messageType === "IMAGE" && message.imageUrl && <button type="button" onClick={() => setViewerOpen(true)} className="block max-w-full"><img src={imageSrc} alt="Shared image" loading="lazy" className="mb-2 max-h-[22rem] w-auto max-w-full rounded-2xl object-contain" /></button>}
                {message.content && <p className="whitespace-pre-wrap break-words">{text}</p>}
            </>}
            <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-75">{message.edited && !message.deletedForEveryone && <span>edited</span>}{time && new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{ticks}</div>
        </div>
        {mine && <MessageActionsMenu mine={mine} message={message} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe} />}
        <ImageViewer src={viewerOpen ? imageSrc : null} onClose={() => setViewerOpen(false)} />
    </div>;
}
