let audioContext = null;
let toneTimer = null;
let activeNodes = [];

function stopNodes() {
    activeNodes.forEach(node => {
        try {
            node.stop();
            node.disconnect();
        } catch {
            // Ignore already-stopped nodes.
        }
    });
    activeNodes = [];
}

function startOscillator(frequency, startAt, duration) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, audioContext.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime + startAt + 0.02);
    gain.gain.setValueAtTime(0.4, audioContext.currentTime + startAt + duration - 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startAt + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime + startAt);
    oscillator.stop(audioContext.currentTime + startAt + duration + 0.05);
    activeNodes.push(oscillator);
}

export function startRingtone() {
    try {
        if (!audioContext) {
            const AudioCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtor) return;
            audioContext = new AudioCtor();
        }
        if (audioContext.state === "suspended") {
            audioContext.resume().catch(() => {});
        }

        const sequence = [
            [440, 0.5],
            [440, 0.95]
        ];
        const cycle = 1.4;

        let elapsed = 0;
        const playCycle = () => {
            sequence.forEach(([frequency, offset]) => {
                startOscillator(frequency, offset, 0.4);
            });
            elapsed += cycle;
        };

        playCycle();
        toneTimer = setInterval(playCycle, cycle * 1000);
    } catch {
        // Ringtone is best-effort; the visual overlay is the primary indicator.
    }
}

export function stopRingtone() {
    try {
        if (toneTimer) {
            clearInterval(toneTimer);
            toneTimer = null;
        }
        stopNodes();
    } catch {
        // Ignore cleanup errors.
    }
}