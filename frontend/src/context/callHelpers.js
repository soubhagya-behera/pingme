export function mediaErrorMessage(error, callType) {
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

export function getUserMediaFor(callType) {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("WebRTC is not supported in this browser.");
    }
    const constraints = callType === "VIDEO"
        ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
        : { audio: true, video: false };
    return navigator.mediaDevices.getUserMedia(constraints);
}

export function serializeIceCandidate(candidate) {
    try {
        return JSON.stringify(candidate.toJSON ? candidate.toJSON() : candidate);
    } catch {
        return candidate.candidate;
    }
}

export function parseIceCandidate(payload) {
    try {
        return JSON.parse(payload);
    } catch {
        return { candidate: payload };
    }
}

export function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder < 10 ? "0" : ""}${remainder}`;
}
