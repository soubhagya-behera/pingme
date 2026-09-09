import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
    BadgeCheck,
    Check,
    CheckCheck,
    Mic,
    Paperclip,
    Phone,
    Play,
    SendHorizontal,
    Smile,
    Video
} from "lucide-react";

/*
 * Marketing-only preview. Fictional demo conversation —
 * not connected to any real user data.
 */

const SCRIPT = [
    { kind: "them", delay: 600, text: "Hey Aarav! 👋" },
    { kind: "them", delay: 1100, text: "Did you finish the project?" },
    { kind: "typing", delay: 900 },
    { kind: "me", delay: 300, text: "Yes! It's live 🚀", receipt: true },
    { kind: "me", delay: 1000, voice: true, receipt: true }
];

export default function ProductShowcase() {
    const stageRef = useRef(null);
    const inView = useInView(stageRef, { once: true, margin: "-120px" });
    const reduced = useReducedMotion();
    const [stepCount, setStepCount] = useState(0);

    useEffect(() => {
        if (!inView) return;

        if (reduced) {
            setStepCount(SCRIPT.length);
            return;
        }

        let timers = [];
        let elapsed = 0;
        SCRIPT.forEach((_, index) => {
            elapsed += SCRIPT[index].delay;
            timers.push(setTimeout(() => setStepCount(index + 1), elapsed));
        });

        return () => timers.forEach(clearTimeout);
    }, [inView, reduced]);

    const visibleSteps = SCRIPT.slice(0, stepCount);
    const showTyping =
        stepCount < SCRIPT.length &&
        visibleSteps[visibleSteps.length - 1]?.kind === "typing";

    return (
        <section className="lp-section" aria-labelledby="showcase-title">
            <div className="lp-showcase-grid" ref={stageRef}>
                <motion.div
                    className="lp-showcase-copy"
                    initial={reduced ? false : { opacity: 0, x: -34 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: reduced ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="lp-kicker"><span className="lp-kicker-dot" />Live demo</span>
                    <h2 className="lp-title" id="showcase-title">
                        See a conversation <em>come alive</em>
                    </h2>
                    <p className="lp-subtitle">
                        This is what messaging on PingMe feels like — messages appear the
                        instant they are sent, typing indicators bubble up live, and every
                        message confirms delivery with a tick.
                    </p>
                    <ul className="lp-showcase-points">
                        <li><BadgeCheck size={17} /> Delivery and read receipts on every message</li>
                        <li><BadgeCheck size={17} /> Typing indicators streamed over WebSocket</li>
                        <li><BadgeCheck size={17} /> Voice messages, images and files inline</li>
                    </ul>
                </motion.div>

                <motion.div
                    className="lp-demo-window"
                    role="img"
                    aria-label="Animated preview of a PingMe chat conversation"
                    initial={reduced ? false : { opacity: 0, y: 40, rotateX: 8 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: reduced ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="lp-demo-header">
                        <span className="lp-demo-avatar">MJ<i /></span>
                        <span className="lp-demo-id">
                            <b>Mahima Jena</b>
                            <span>● ONLINE</span>
                        </span>
                        <span style={{ display: "flex", gap: 14, marginLeft: "auto", color: "#b9aed6" }} aria-hidden="true">
                            <Phone size={17} />
                            <Video size={18} />
                        </span>
                    </div>

                    <div className="lp-demo-body">
                        {visibleSteps.map((step, index) => {
                            if (step.kind === "typing") return null;
                            const isMe = step.kind === "me";
                            return (
                                <motion.div
                                    key={index}
                                    className={`lp-demo-msg ${isMe ? "me" : "them"}`}
                                    initial={reduced ? false : { opacity: 0, y: 12, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
                                >
                                    {step.voice ? (
                                        <span className="lp-demo-voice">
                                            <span className="play"><Play size={13} fill="currentColor" /></span>
                                            <span className="lp-demo-bars" aria-hidden="true">
                                                {[7, 12, 9, 15, 10, 16, 8, 13, 6, 11].map((height, barIndex) => (
                                                    <i key={barIndex} style={{ height }} />
                                                ))}
                                            </span>
                                            0:12
                                        </span>
                                    ) : step.text}
                                    {isMe && (
                                        <span className="tick" aria-hidden="true">
                                            {step.receipt ? <CheckCheck size={14} /> : <Check size={14} />}
                                        </span>
                                    )}
                                </motion.div>
                            );
                        })}

                        {showTyping && (
                            <motion.span
                                className="lp-demo-typing"
                                initial={reduced ? false : { opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                aria-label="Mahima is typing"
                            >
                                <i /><i /><i />
                            </motion.span>
                        )}
                    </div>

                    <div className="lp-demo-input" aria-hidden="true">
                        <Smile size={17} />
                        <Paperclip size={16} />
                        <Mic size={16} />
                        Type a message…
                        <span className="lp-demo-send"><SendHorizontal size={15} /></span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
