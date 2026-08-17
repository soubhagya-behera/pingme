import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import Avatar from "../ui/Avatar";
import { MediaVideo, MediaAudio } from "./MediaViews";
import { useCall } from "../../context/CallContext";

export default function ActiveCallOverlay() {
    const {
        call,
        localStream,
        remoteStream,
        duration,
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
                className={`call-screen call-screen-active ${isVideo ? "is-video" : ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                role="dialog"
                aria-label="Active call"
            >
                {isVideo ? (
                    <div className="call-video-stage">
                        {remoteStream ? (
                            <MediaVideo
                                stream={remoteStream}
                                className="call-remote-video"
                            />
                        ) : (
                            <div className="call-video-fallback">
                                <Avatar
                                    name={call.peer.fullName}
                                    src={call.peer.profilePicture}
                                    size={120}
                                />
                                <span>Connecting...</span>
                            </div>
                        )}
                        {localStream && (
                            <MediaVideo
                                stream={localStream}
                                className="call-local-pip"
                                muted
                            />
                        )}
                    </div>
                ) : (
                    <div className="call-screen-voice">
                        <MediaAudio stream={remoteStream} />
                        <div className="call-avatar-ring is-large">
                            <Avatar
                                name={call.peer.fullName}
                                src={call.peer.profilePicture}
                                size={124}
                            />
                        </div>
                        <h2 className="call-name">{call.peer.fullName}</h2>
                        <p className="call-subtext">{duration}</p>
                    </div>
                )}

                {isVideo && (
                    <div className="call-video-heading">
                        <h2 className="call-name">{call.peer.fullName}</h2>
                        <p className="call-subtext">{duration}</p>
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