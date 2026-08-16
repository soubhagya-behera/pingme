import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { formatDuration } from "./AttachmentUtils";

let activePlayer = null;

export default function VoiceMessagePlayer({ src, duration, mine = false }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [mediaDuration, setMediaDuration] = useState(Number(duration) || 0);
    const [playError, setPlayError] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (activePlayer === audio) activePlayer = null;
        };
    }, []);

    function togglePlay() {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            return;
        }
        setPlayError(false);
        if (activePlayer && activePlayer !== audio) {
            try {
                activePlayer.pause();
            } catch {
                // Ignore: another player may already be paused.
            }
        }
        activePlayer = audio;
        audio.play()
            .then(() => setIsPlaying(true))
            .catch(() => setPlayError(true));
    }

    function seek(event) {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(mediaDuration) || mediaDuration <= 0) return;
        const nextTime = (Number(event.target.value) / 100) * mediaDuration;
        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
    }

    const displayDuration = mediaDuration > 0 ? mediaDuration : Number(duration) || 0;
    const progress = mediaDuration > 0 ? Math.min(100, (currentTime / mediaDuration) * 100) : 0;

    return (
        <div className={`voice-player ${mine ? "is-mine" : ""}`}>
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                onLoadedMetadata={event => {
                    const actual = event.currentTarget.duration;
                    if (Number.isFinite(actual) && actual > 0) {
                        setMediaDuration(Math.round(actual * 10) / 10);
                    }
                }}
                onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }}
            />
            <button
                type="button"
                className="voice-player-button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="voice-player-track">
                <input
                    type="range"
                    className="voice-player-progress"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={seek}
                    aria-label="Playback progress"
                    style={{ "--voice-progress": `${progress}%` }}
                />
            </div>
            <span className="voice-player-time">
                {formatDuration(currentTime)} / {formatDuration(displayDuration)}
            </span>
            {playError && <span className="voice-player-error">Playback unavailable</span>}
        </div>
    );
}