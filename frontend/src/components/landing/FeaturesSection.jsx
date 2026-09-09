import { motion, useReducedMotion } from "framer-motion";
import {
    Bell,
    CheckCheck,
    FileAudio,
    ImageIcon,
    MessagesSquare,
    Paperclip,
    PhoneCall,
    Search,
    UserPlus
} from "lucide-react";

export default function FeaturesSection() {
    const reduced = useReducedMotion();

    const reveal = (delay = 0) => ({
        initial: reduced ? false : { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: reduced ? 0 : 0.65, delay, ease: [0.22, 1, 0.36, 1] }
    });

    return (
        <section className="lp-section" id="features" aria-labelledby="features-title">
            <div className="lp-section-head" {...reveal()}>
                <span className="lp-kicker"><span className="lp-kicker-dot" />Features</span>
                <h2 className="lp-title" id="features-title">
                    Everything you need to <em>stay connected</em>
                </h2>
                <p className="lp-subtitle">
                    PingMe is built around one promise — conversations that feel instant.
                    Messaging, friends, presence and calls work together in real time.
                </p>
            </div>

            <div className="lp-bento">
                {/* Real-time chat — large card */}
                <motion.article className="lp-card lp-cell lp-cell-wide" {...reveal(0)}>
                    <span className="lp-cell-icon"><MessagesSquare size={21} /></span>
                    <h3>Real-time messaging</h3>
                    <p>
                        Messages travel over a persistent WebSocket connection the moment you
                        press send. Live typing indicators, delivery and read receipts, plus
                        edit and delete keep every conversation in sync.
                    </p>
                    <div className="lp-mini-chat" aria-hidden="true">
                        <div className="lp-mini-bubble lp-mini-them">Hey! Are you seeing this? 👀</div>
                        <div className="lp-mini-bubble lp-mini-me">
                            Just landed — reading now
                            <span className="lp-mini-meta"><CheckCheck size={13} /></span>
                        </div>
                        <div className="lp-mini-bubble lp-mini-them">Perfect. Ping me later!</div>
                    </div>
                </motion.article>

                {/* Online presence — tall card */}
                <motion.article className="lp-card lp-cell lp-cell-tall" {...reveal(0.08)}>
                    <span className="lp-cell-icon"><UserPlus size={21} /></span>
                    <h3>Friends &amp; live presence</h3>
                    <p>
                        Find people by email, send friend requests and see exactly who is
                        online right now. Presence updates flow through the same realtime
                        network as your messages.
                    </p>
                    <div className="lp-presence-row">
                        <span className="lp-presence-avatar" style={{ background: "linear-gradient(135deg,#f472b6,#8b5cf6)" }}>MJ
                            <i className="lp-presence-dot online" />
                        </span>
                        <span className="lp-presence-name">Mahima Jena</span>
                        <span className="lp-presence-state">Online</span>
                    </div>
                    <div className="lp-presence-row">
                        <span className="lp-presence-avatar" style={{ background: "linear-gradient(135deg,#38bdf8,#6366f1)" }}>RS
                            <i className="lp-presence-dot online" />
                        </span>
                        <span className="lp-presence-name">Rohit Satapathy</span>
                        <span className="lp-presence-state">Online</span>
                    </div>
                    <div className="lp-presence-row">
                        <span className="lp-presence-avatar" style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899)" }}>AK
                            <i className="lp-presence-dot off" />
                        </span>
                        <span className="lp-presence-name">Ananya Kar</span>
                        <span className="lp-presence-state">Away</span>
                    </div>
                    <div className="lp-net-visual" aria-hidden="true">
                        <NetSvg />
                    </div>
                </motion.article>

                {/* Calls */}
                <motion.article className="lp-card lp-cell lp-cell-third" {...reveal(0.12)}>
                    <span className="lp-cell-icon"><PhoneCall size={21} /></span>
                    <h3>Voice &amp; video calls</h3>
                    <p>
                        Start audio or video calls with friends directly from chat, powered by
                        peer-to-peer WebRTC with ringing, missed-call alerts and call history.
                    </p>
                    <div className="lp-call-visual" aria-hidden="true">
                        <span className="lp-call-avatar" style={{ background: "linear-gradient(135deg,#f472b6,#8b5cf6)" }}>MJ</span>
                        <span className="lp-call-wave">
                            {[10, 18, 26, 14, 30, 20, 12, 24].map((height, index) => (
                                <i key={index} style={{ height, animationDelay: `${index * 0.09}s` }} />
                            ))}
                        </span>
                    </div>
                </motion.article>

                {/* Media & voice messages */}
                <motion.article className="lp-card lp-cell lp-cell-third" {...reveal(0.16)}>
                    <span className="lp-cell-icon"><Paperclip size={21} /></span>
                    <h3>Richer than text</h3>
                    <p>
                        Share images, files and record voice messages without leaving the
                        conversation — everything previews inline.
                    </p>
                    <div className="lp-attach-row" aria-hidden="true">
                        <div className="lp-attach-chip">
                            <ImageIcon size={17} />
                            <span>sunset-shot.png<small>IMAGE · 1.2 MB</small></span>
                        </div>
                        <div className="lp-attach-chip">
                            <FileAudio size={17} />
                            <span>voice-message.webm<small>VOICE · 0:14</small></span>
                        </div>
                    </div>
                </motion.article>

                {/* Notifications + search */}
                <motion.article className="lp-card lp-cell lp-cell-third" {...reveal(0.2)}>
                    <span className="lp-cell-icon"><Bell size={21} /></span>
                    <h3>Never miss a ping</h3>
                    <p>
                        Realtime notifications for new messages, friend requests and calls.
                        Search any conversation to find that one message instantly.
                    </p>
                    <div className="lp-attach-row" aria-hidden="true">
                        <div className="lp-attach-chip">
                            <Bell size={17} />
                            <span>New message from Mahima<small>REALTIME ALERT</small></span>
                        </div>
                        <div className="lp-attach-chip">
                            <Search size={17} />
                            <span>Search chats…<small>INSTANT RESULTS</small></span>
                        </div>
                    </div>
                </motion.article>
            </div>
        </section>
    );
}

function NetSvg() {
    return (
        <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g stroke="rgba(167,139,250,.4)" strokeDasharray="3 7" strokeWidth="1.4" fill="none">
                <path d="M160 60 60 26M160 60l100-34M160 60 84 100M160 60l76 40M160 60h0" />
            </g>
            {[[60, 26, "#f472b6"], [260, 26, "#67e8f9"], [84, 100, "#a78bfa"], [236, 100, "#34d399"]].map(([x, y, fill], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r="11" fill={fill} opacity=".22">
                        <animate attributeName="opacity" values=".14;.4;.14" dur={`${2.4 + i * 0.5}s`} repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r="6" fill={fill} />
                </g>
            ))}
            <circle cx="160" cy="60" r="15" fill="#8b5cf6" opacity=".25" />
            <circle cx="160" cy="60" r="9" fill="#c4b5fd" />
        </svg>
    );
}
