import { motion } from "framer-motion";
import { Phone, Video, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import { useCall } from "../../context/CallContext";

export default function IncomingCallOverlay() {
    const { call, answerCall, rejectCall } = useCall();
    if (!call) return null;

    const isVideo = call.callType === "VIDEO";
    const Icon = isVideo ? Video : Phone;

    return (
        <div className="call-overlay">
            <motion.div
                className="call-card call-card-incoming"
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                role="dialog"
                aria-label="Incoming call"
            >
                <span className={`call-type-badge ${isVideo ? "is-video" : ""}`}>
                    <Icon size={22} />
                </span>
                <span className="call-title">
                    {isVideo ? "Incoming video call" : "Incoming voice call"}
                </span>
                <div className="call-avatar-ring">
                    <Avatar
                        name={call.peer.fullName}
                        src={call.peer.profilePicture}
                        size={104}
                    />
                </div>
                <h2 className="call-name">{call.peer.fullName}</h2>
                <p className="call-subtext">
                    {isVideo
                        ? "Incoming video call..."
                        : "Incoming voice call..."}
                </p>
                <div className="call-actions">
                    <button
                        type="button"
                        className="call-action is-reject"
                        onClick={rejectCall}
                        aria-label="Reject call"
                    >
                        <span className="call-action-icon"><X size={24} /></span>
                        <span>Reject</span>
                    </button>
                    <button
                        type="button"
                        className="call-action is-answer"
                        onClick={answerCall}
                        aria-label="Answer call"
                    >
                        <span className="call-action-icon"><Phone size={24} /></span>
                        <span>Answer</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}