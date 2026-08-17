import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import Avatar from "../ui/Avatar";
import { MediaVideo } from "./MediaViews";
import { useCall } from "../../context/CallContext";

export default function OutgoingCallOverlay() {
    const {
        call,
        localStream,
        muted,
        cameraOff,
        toggleMute,
        toggleCamera,
        endCall
    } = useCall();

    if (!call) return null;

    const isVideo = call.callType === "VIDEO";

    return (
        <div className="call-overlay">
            <motion.div
                className={`call-screen call-screen-outgoing ${isVideo ? "is-video" : ""}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="dialog"
                aria-label="Outgoing call"
            >
                {isVideo ? (
                    <div className="call-video-stage">
                        <MediaVideo
                            stream={localStream}
                            className="call-local-preview"
                            muted
                        />
                        {!localStream && (
                            <div className="call-video-fallback">
                                <Video size={40} />
                                <span>Starting video...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="call-screen-voice">
                        <div className="call-avatar-ring">
                            <Avatar
                                name={call.peer.fullName}
                                src={call.peer.profilePicture}
                                size={116}
                            />
                        </div>
                        <h2 className="call-name">{call.peer.fullName}</h2>
                        <p className="call-subtext">Calling...</p>
                    </div>
                )}

                {isVideo && (
                    <div className="call-video-heading">
                        <h2 className="call-name">{call.peer.fullName}</h2>
                        <p className="call-subtext">Calling...</p>
                    </div>
                )}

                <div className="call-controls">
                    <button
                        type="button"
                        className={`call-control ${muted ? "is-active" : ""}`}
                        onClick={toggleMute}
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        {muted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>
                    {isVideo && (
                        <button
                            type="button"
                            className={`call-control ${cameraOff ? "is-active" : ""}`}
                            onClick={toggleCamera}
                            aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
                        >
                            {cameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                        </button>
                    )}
                    <button
                        type="button"
                        className="call-control is-end"
                        onClick={endCall}
                        aria-label="End call"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}