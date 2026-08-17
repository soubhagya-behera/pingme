import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { v4 as uuid } from "uuid";
import { useSocket } from "./SocketProvider";
import { publishCallSignal } from "../websocket/publisher";
import { getRtcConfiguration, CALL_TIMEOUT_SECONDS } from "../constants/rtcConfig";
import { startRingtone, stopRingtone } from "../services/callSound";
import IncomingCallOverlay from "../components/call/IncomingCallOverlay";
import OutgoingCallOverlay from "../components/call/OutgoingCallOverlay";
import ActiveCallOverlay from "../components/call/ActiveCallOverlay";
import "../styles/user/call/call.css";

const CallContext = createContext(null);

function mediaErrorMessage(error, callType) {
    if (error?.name === "NotAllowedError") {
        return callType === "VIDEO"
            ? "Camera or microphone permission denied."
            : "Microphone permission denied.";
    }
    if (error?.name === "NotFoundError") {
        return callType === "VIDEO"
            ? "Camera or microphone not found."
            : "Microphone not found.";
    }
    if (error?.name === "NotReadableError") {
        return callType === "VIDEO"
            ? "Camera or microphone is already in use by another app."
            : "Microphone is already in use by another app.";
    }
    if (error?.name === "SecurityError") {
        return "Media access was blocked by your browser.";
    }
    return "Could not start your microphone/camera.";
}

function getUserMediaFor(callType) {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("WebRTC is not supported in this browser.");
    }
    const constraints = callType === "VIDEO"
        ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
        : { audio: true, video: false };
    return navigator.mediaDevices.getUserMedia(constraints);
}

function serializeIceCandidate(candidate) {
    try {
        return JSON.stringify(candidate.toJSON ? candidate.toJSON() : candidate);
    } catch {
        return candidate.candidate;
    }
}

function parseIceCandidate(payload) {
    try {
        return JSON.parse(payload);
    } catch {
        return { candidate: payload };
    }
}

function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder < 10 ? "0" : ""}${remainder}`;
}

export function CallProvider({ children }) {
    const socket = useSocket();

    const [call, setCall] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);

    const callRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const pendingOfferRef = useRef(null);
    const pendingIceRef = useRef([]);
    const timersRef = useRef(new Set());
    const durationIntervalRef = useRef(null);
    const durationRef = useRef(0);

    function patchCall(partial) {
        callRef.current = callRef.current
            ? { ...callRef.current, ...partial }
            : partial;
        setCall(callRef.current);
    }

    function clearTimers() {
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current = new Set();
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
    }

    function startDurationTimer() {
        clearTimers();
        durationRef.current = 0;
        setDuration(0);
        durationIntervalRef.current = setInterval(() => {
            durationRef.current += 1;
            setDuration(durationRef.current);
        }, 1000);
    }

    function cleanupWebRtc() {
        clearTimers();
        stopRingtone();

        const pc = peerConnectionRef.current;
        if (pc) {
            pc.onicecandidate = null;
            pc.ontrack = null;
            pc.onconnectionstatechange = null;
            pc.oniceconnectionstatechange = null;
            pc.onicecandidateerror = null;
            try {
                pc.close();
            } catch {
                // Already closed.
            }
        }
        peerConnectionRef.current = null;

        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;

        pendingOfferRef.current = null;
        pendingIceRef.current = [];

        setLocalStream(null);
        setRemoteStream(null);
        setDuration(0);
        setMuted(false);
        setCameraOff(false);
    }

    function resetToIdle() {
        cleanupWebRtc();
        callRef.current = null;
        setCall(null);
    }

    function createPeerConnection() {
        const pc = new RTCPeerConnection(getRtcConfiguration());

        localStreamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current);
        });

        pc.onicecandidate = event => {
            if (!event.candidate || !callRef.current) return;
            publishCallSignal({
                callId: callRef.current.callId,
                receiverId: callRef.current.peer.id,
                event: "ICE_CANDIDATE",
                candidate: serializeIceCandidate(event.candidate)
            });
        };

        pc.ontrack = event => {
            const [stream] = event.streams;
            if (stream) setRemoteStream(stream);
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "failed") {
                toast.error("Call connection failed.");
                resetToIdle();
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "failed") {
                toast.error("Network connection failed.");
                resetToIdle();
            }
        };

        pc.onicecandidateerror = () => {
            // Best-effort STUN/ICE; a temporary failure is non-fatal.
        };

        peerConnectionRef.current = pc;
        return pc;
    }

    function flushPendingIce() {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        pendingIceRef.current.forEach(candidate => {
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        });
        pendingIceRef.current = [];
    }

    function startAnswerTimer(callId) {
        clearTimers();
        const timer = setTimeout(() => {
            if (callRef.current?.callId !== callId) return;
            const peer = callRef.current.peer;
            publishCallSignal({ callId, receiverId: peer.id, event: "CALL_TIMEOUT" });
            resetToIdle();
            toast("No answer");
        }, CALL_TIMEOUT_SECONDS * 1000);
        timersRef.current.add(timer);
    }

    function startRingTimer(callId) {
        clearTimers();
        const timer = setTimeout(() => {
            if (callRef.current?.callId !== callId) return;
            resetToIdle();
        }, CALL_TIMEOUT_SECONDS * 1000);
        timersRef.current.add(timer);
    }

    async function startCall(peer, callType) {
        if (callRef.current) return;
        if (!peer?.id) return;

        try {
            const stream = await getUserMediaFor(callType);
            localStreamRef.current = stream;
            setLocalStream(stream);

            createPeerConnection();

            const callId = uuid();
            patchCall({
                phase: "outbound",
                callId,
                callType,
                peer: {
                    id: peer.id,
                    fullName: peer.fullName,
                    profilePicture: peer.profilePicture
                },
                status: "Calling..."
            });

            const pc = peerConnectionRef.current;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            publishCallSignal({
                callId,
                receiverId: peer.id,
                callType,
                event: "CALL_OFFER",
                sdp: JSON.stringify(pc.localDescription)
            });

            startAnswerTimer(callId);
        } catch (error) {
            resetToIdle();
            toast.error(mediaErrorMessage(error, callType));
        }
    }

    async function answerCall() {
        const current = callRef.current;
        if (!current || current.phase !== "incoming") return;
        if (!pendingOfferRef.current) return;

        try {
            const stream = await getUserMediaFor(current.callType);
            localStreamRef.current = stream;
            setLocalStream(stream);

            const pc = createPeerConnection();
            await pc.setRemoteDescription(
                new RTCSessionDescription(JSON.parse(pendingOfferRef.current))
            );

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            publishCallSignal({
                callId: current.callId,
                receiverId: current.peer.id,
                callType: current.callType,
                event: "CALL_ANSWER",
                sdp: JSON.stringify(pc.localDescription)
            });

            flushPendingIce();
            stopRingtone();
            patchCall({ phase: "active" });
            startDurationTimer();
        } catch (error) {
            resetToIdle();
            toast.error(mediaErrorMessage(error, current.callType));
        }
    }

    function rejectCall() {
        const current = callRef.current;
        if (!current || current.phase !== "incoming") return;
        publishCallSignal({
            callId: current.callId,
            receiverId: current.peer.id,
            event: "CALL_REJECT"
        });
        resetToIdle();
    }

    function endCall() {
        const current = callRef.current;
        if (!current) return;
        publishCallSignal({
            callId: current.callId,
            receiverId: current.peer.id,
            event: "CALL_END"
        });
        resetToIdle();
    }

    function toggleMute() {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setMuted(!track.enabled);
    }

    function toggleCamera() {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setCameraOff(!track.enabled);
    }

    function handleIncomingOffer(signal) {
        if (callRef.current) {
            publishCallSignal({
                callId: signal.callId,
                receiverId: signal.callerId,
                callType: signal.callType,
                event: "CALL_BUSY"
            });
            return;
        }

        pendingOfferRef.current = signal.sdp;
        pendingIceRef.current = [];

        patchCall({
            phase: "incoming",
            callId: signal.callId,
            callType: signal.callType,
            peer: {
                id: signal.callerId,
                fullName: signal.callerName || "Unknown",
                profilePicture: signal.callerProfilePicture || null
            },
            status: "Incoming call"
        });

        startRingtone();
        startRingTimer(signal.callId);
    }

    function handleAnswer(signal) {
        const current = callRef.current;
        if (!current || current.phase !== "outbound" || current.callId !== signal.callId) return;
        if (!signal.sdp) return;

        clearTimers();
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.sdp)))
                .then(() => flushPendingIce())
                .catch(() => {
                    resetToIdle();
                    toast.error("Call failed.");
                });
            patchCall({ phase: "active" });
            startDurationTimer();
        } catch {
            resetToIdle();
            toast.error("Call failed.");
        }
    }

    function handleRemoteIce(signal) {
        const current = callRef.current;
        if (!current || current.callId !== signal.callId) return;
        const pc = peerConnectionRef.current;
        if (!pc) return;

        const candidate = parseIceCandidate(signal.candidate);
        if (pc.remoteDescription) {
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        } else {
            pendingIceRef.current.push(candidate);
        }
    }

    function handleReject(signal) {
        const current = callRef.current;
        if (!current || current.callId !== signal.callId) return;
        resetToIdle();
        toast.error("Call rejected");
    }

    function handleBusy(signal) {
        const current = callRef.current;
        if (!current || current.callId !== signal.callId) return;
        resetToIdle();
        toast.error(signal.status || "User is busy");
    }

    function handleRemoteEnd(signal) {
        const current = callRef.current;
        if (!current || current.callId !== signal.callId) return;
        resetToIdle();
    }

    function handleRemoteTimeout(signal) {
        const current = callRef.current;
        if (!current || current.callId !== signal.callId) return;
        resetToIdle();
    }

    function handleSignal(signal) {
        switch (signal.event) {
            case "CALL_OFFER":
                handleIncomingOffer(signal);
                break;
            case "CALL_ANSWER":
                handleAnswer(signal);
                break;
            case "ICE_CANDIDATE":
                handleRemoteIce(signal);
                break;
            case "CALL_REJECT":
                handleReject(signal);
                break;
            case "CALL_BUSY":
                handleBusy(signal);
                break;
            case "CALL_END":
                handleRemoteEnd(signal);
                break;
            case "CALL_TIMEOUT":
                handleRemoteTimeout(signal);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (!socket?.onCallSignal) return;
        const remove = socket.onCallSignal(handleSignal);
        return remove;
    }, [socket]);

    useEffect(() => {
        return () => {
            cleanupWebRtc();
        };
    }, []);

    const value = {
        call,
        localStream,
        remoteStream,
        duration: formatDuration(duration),
        muted,
        cameraOff,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera
    };

    return (
        <CallContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {call?.phase === "incoming" && <IncomingCallOverlay />}
                {call?.phase === "outbound" && <OutgoingCallOverlay />}
                {call?.phase === "active" && <ActiveCallOverlay />}
            </AnimatePresence>
        </CallContext.Provider>
    );
}

export function useCall() {
    return useContext(CallContext);
}