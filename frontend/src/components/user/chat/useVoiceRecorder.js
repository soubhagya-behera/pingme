import { useCallback, useEffect, useRef, useState } from "react";
import { voiceExtension } from "./AttachmentUtils";

export const VOICE_MAX_SECONDS = 120;

const MIME_CANDIDATES = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg"
];

export function isMediaRecorderSupported() {
    return typeof window !== "undefined" && "MediaRecorder" in window;
}

export function pickVoiceMimeType() {
    if (!isMediaRecorderSupported()) return "";
    for (const candidate of MIME_CANDIDATES) {
        if (MediaRecorder.isTypeSupported(candidate)) return candidate;
    }
    return "";
}

function friendlyError(error) {
    if (!error) return "Recording failed. Please try again.";
    switch (error.name) {
        case "NotAllowedError":
            return "Microphone permission was denied. Allow microphone access to send voice messages.";
        case "NotFoundError":
            return "No microphone was found on this device.";
        case "NotReadableError":
            return "Your microphone is currently unavailable or in use.";
        case "SecurityError":
            return "Microphone access is not allowed on this page.";
        default:
            return "Couldn't start recording. Please try again.";
    }
}

function createVoiceFile(blob, mimeType) {
    return new File([blob], `voice-${Date.now()}.${voiceExtension(mimeType)}`, { type: mimeType });
}

export function useVoiceRecorder({ onStop, onError } = {}) {
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [error, setError] = useState("");

    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);
    const mimeRef = useRef("");
    const stopRecordingRef = useRef(null);
    const startingRef = useRef(false);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const stopTracks = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const releaseResources = () => {
        clearTimer();
        stopTracks();
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== "inactive") {
            try {
                recorder.onstop = null;
                recorder.stop();
            } catch {
                // Ignore: the recorder may already be stopping.
            }
        }
        recorderRef.current = null;
        chunksRef.current = [];
        startTimeRef.current = 0;
        setSeconds(0);
        setRecording(false);
    };

    useEffect(() => () => releaseResources(), []);

    const startRecording = useCallback(async () => {
        if (startingRef.current || recorderRef.current || streamRef.current || recording) return;
        startingRef.current = true;

        try {
            setError("");
            if (!isMediaRecorderSupported()) {
                const message = "Voice recording is not supported in this browser.";
                setError(message);
                onError?.(message);
                return;
            }

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
                const message = friendlyError(err);
                setError(message);
                onError?.(message);
                return;
            }

            const mimeType = pickVoiceMimeType();
            let recorder;
            try {
                recorder = mimeType
                    ? new MediaRecorder(stream, { mimeType })
                    : new MediaRecorder(stream);
            } catch {
                try {
                    recorder = new MediaRecorder(stream);
                } catch (err) {
                    stopTracks();
                    const message = friendlyError(err);
                    setError(message);
                    onError?.(message);
                    return;
                }
            }

            streamRef.current = stream;
            recorderRef.current = recorder;
            mimeRef.current = recorder.mimeType || mimeType || "audio/webm";
            chunksRef.current = [];
            recorder.addEventListener("dataavailable", event => {
                if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
            });

            try {
                recorder.start();
            } catch (err) {
                releaseResources();
                const message = friendlyError(err);
                setError(message);
                onError?.(message);
                return;
            }

            startTimeRef.current = Date.now();
            setSeconds(0);
            setRecording(true);

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setSeconds(elapsed);
                if (elapsed >= VOICE_MAX_SECONDS) {
                    stopRecordingRef.current?.().then(result => {
                        if (result) onStop?.(result);
                    });
                }
            }, 250);
        } finally {
            startingRef.current = false;
        }
    }, [recording, onError, onStop]);

    const stopRecording = useCallback(() => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === "inactive") return Promise.resolve(null);

        return new Promise(resolve => {
            const handleStop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeRef.current });
                const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
                const mimeType = mimeRef.current;
                clearTimer();
                stopTracks();
                recorderRef.current = null;
                chunksRef.current = [];
                startTimeRef.current = 0;
                setSeconds(0);
                setRecording(false);
                resolve({
                    file: createVoiceFile(blob, mimeType),
                    blob,
                    durationSeconds,
                    mimeType
                });
            };
            recorder.addEventListener("stop", handleStop, { once: true });
            try {
                recorder.stop();
            } catch {
                handleStop();
            }
        });
    }, []);

    stopRecordingRef.current = stopRecording;

    const cancelRecording = useCallback(() => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === "inactive") {
            releaseResources();
            return Promise.resolve();
        }
        return new Promise(resolve => {
            const handleStop = () => {
                clearTimer();
                stopTracks();
                recorderRef.current = null;
                chunksRef.current = [];
                startTimeRef.current = 0;
                setSeconds(0);
                setRecording(false);
                resolve();
            };
            recorder.addEventListener("stop", handleStop, { once: true });
            try {
                recorder.stop();
            } catch {
                handleStop();
            }
        });
    }, []);

    return {
        recording,
        seconds,
        error,
        maxSeconds: VOICE_MAX_SECONDS,
        startRecording,
        stopRecording,
        cancelRecording,
        clearError: () => setError("")
    };
}