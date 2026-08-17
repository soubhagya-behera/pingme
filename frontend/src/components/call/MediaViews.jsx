import { useEffect, useRef } from "react";

export function MediaVideo({ stream, className, muted = false }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        } else if (ref.current) {
            ref.current.srcObject = null;
        }
    }, [stream]);

    return (
        <video
            ref={ref}
            className={className}
            autoPlay
            playsInline
            muted={muted}
        />
    );
}

export function MediaAudio({ stream }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return <audio ref={ref} autoPlay />;
}