import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCheck,
  Heart,
  Mic,
  MessageCircleMore,
  Send,
  Smile,
} from "lucide-react";

const float = (duration, delay = 0) => ({
  duration,
  delay,
  repeat: Infinity,
  repeatType: "mirror",
  ease: [0.45, 0, 0.55, 1],
});

function Float({ className, children, duration, delay = 0, reducedMotion }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [0, -9, 0], rotate: [0, 0.7, 0], scale: [1, 1.012, 1] }}
      transition={reducedMotion ? { duration: 0.2 } : { ...float(duration, delay), opacity: { duration: 0.45, delay } }}
    >
      {children}
    </motion.div>
  );
}

function MessageCard({ className, avatar, name, children, meta }) {
  return (
    <div className={`message-card ${className}`}>
      <span className={`message-avatar ${avatar}`}>{name.slice(0, 1)}</span>
      <span className="message-card-copy"><b>{name}</b><span>{children}</span></span>
      {meta && <span className="message-card-meta">{meta}</span>}
    </div>
  );
}

export default function MessagingIllustration() {
  const reducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 4,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * -4,
    });
  };

  return (
    <motion.div
      className="messaging-illustration"
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{ rotateY: tilt.x, rotateX: tilt.y }}
      transition={{ type: "spring", stiffness: 55, damping: 18, mass: 0.8 }}
    >
      <div className="illustration-halo" />
      <div className="illustration-ring illustration-ring-outer" />
      <div className="illustration-ring illustration-ring-inner" />

      <svg className="illustration-connections" viewBox="0 0 620 560" role="presentation">
        <path d="M104 168C164 128 208 138 251 206M390 146c45 8 70 42 75 92M125 390c38-18 71-24 111-9M376 406c32-29 64-38 102-27" />
        <circle cx="104" cy="168" r="3" /><circle cx="251" cy="206" r="3" /><circle cx="390" cy="146" r="3" /><circle cx="465" cy="238" r="3" />
      </svg>

      <Float className="float-message-card float-message-card-primary" duration={6.8} reducedMotion={reducedMotion}>
        <MessageCard avatar="avatar-amber" name="Maya" meta="now">Let’s catch up soon ✨</MessageCard>
      </Float>

      <Float className="float-message-card float-message-card-secondary" duration={7.4} delay={0.25} reducedMotion={reducedMotion}>
        <MessageCard avatar="avatar-indigo" name="Alex"><span className="voice-wave"><i /><i /><i /><i /><i /></span> 0:12</MessageCard>
      </Float>

      <Float className="float-notification" duration={5.8} delay={0.2} reducedMotion={reducedMotion}>
        <MessageCircleMore size={20} />
        <span className="notification-count">2</span>
      </Float>

      <Float className="float-profile" duration={7} delay={0.6} reducedMotion={reducedMotion}>
        <span className="profile-photo">A</span><span className="online-indicator" />
      </Float>

      <Float className="float-heart" duration={5.3} delay={0.35} reducedMotion={reducedMotion}><Heart size={19} fill="currentColor" /></Float>
      <Float className="float-emoji" duration={6.2} delay={0.1} reducedMotion={reducedMotion}><Smile size={21} /></Float>

      <Float className="float-typing" duration={6.5} delay={0.55} reducedMotion={reducedMotion}>
        <span>Writing a reply</span><span className="typing-dots"><i /><i /><i /></span>
      </Float>

      <motion.div
        className="woman-scene"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [0, -4, 0], scale: 1 }}
        transition={reducedMotion ? { duration: 0.25 } : { ...float(7.5), opacity: { duration: 0.7 }, scale: { duration: 0.7 } }}
      >
        <svg className="woman-art" viewBox="0 0 460 460" role="presentation">
          <defs>
            <linearGradient id="pm-jacket" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c4b5fd" /><stop offset="1" stopColor="#6366f1" /></linearGradient>
            <linearGradient id="pm-trousers" x1="0" x2="1"><stop stopColor="#312e81" /><stop offset="1" stopColor="#1e1b4b" /></linearGradient>
            <linearGradient id="pm-skin" x1="0" x2="1"><stop stopColor="#f4c5ae" /><stop offset="1" stopColor="#e3a78c" /></linearGradient>
          </defs>
          <ellipse cx="230" cy="420" rx="168" ry="22" fill="#020617" opacity=".35" />
          <path d="M85 385c38-53 98-80 175-80 72 0 125 26 154 80H85z" fill="#8b5cf6" opacity=".16" />
          <path d="M142 335c-1-67 33-113 87-117 58-4 98 37 103 117l-31 30H173z" fill="url(#pm-jacket)" />
          <path d="M213 222h42l15 65h-69z" fill="url(#pm-skin)" />
          <path d="M154 344c28 7 59 17 92 18 33 1 61-6 91-18l18 51H137z" fill="#ede9fe" opacity=".92" />
          <path d="M177 363c-42 3-72 20-93 47h134l-3-46zM267 363c48 4 79 20 103 47H237l30-47z" fill="url(#pm-trousers)" />
          <path d="M125 402h94v17h-109c0-9 6-16 15-17zM242 403h113c9 1 15 8 15 17H238z" fill="#c4b5fd" />
          <path d="M170 154c0-49 28-81 66-81 44 0 72 34 67 85-3 36-23 62-66 62-42 0-67-28-67-66z" fill="url(#pm-skin)" />
          <path d="M167 150c-8-46 19-92 68-94 45-1 80 32 75 78-18-9-37-28-48-52-19 29-52 47-95 50z" fill="#201a47" />
          <path d="M175 128c-17 7-27 25-22 44 3 14 11 23 23 27M299 130c15 8 22 25 18 42-3 13-10 22-21 26" fill="url(#pm-skin)" />
          <ellipse cx="205" cy="159" rx="4" ry="5" fill="#292044" /><ellipse cx="267" cy="159" rx="4" ry="5" fill="#292044" />
          <path d="M219 189c10 7 22 7 33 0" fill="none" stroke="#a66561" strokeWidth="3" strokeLinecap="round" />
          <path d="M177 283c21-14 42-13 61 1l-18 50-69-15zM292 279c-19-12-39-10-57 4l19 48 67-13z" fill="url(#pm-skin)" />
          <g transform="rotate(9 248 292)"><rect x="219" y="242" width="64" height="111" rx="14" fill="#111827" stroke="#ddd6fe" strokeWidth="4" /><rect x="226" y="254" width="50" height="82" rx="9" fill="#f5f3ff" /><circle cx="251" cy="344" r="3" fill="#a78bfa" /><path d="M237 274h28M237 284h20" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" /><circle cx="242" cy="305" r="8" fill="#c4b5fd" /><path d="M254 301h13M254 310h10" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" /></g>
        </svg>
        <span className="phone-pulse"><Send size={13} fill="currentColor" /></span>
      </motion.div>

      <div className="scene-label"><span className="scene-label-dot" />Always in sync</div>
      <CheckCheck className="scene-delivered" size={17} />
      <Mic className="scene-mic" size={15} />
    </motion.div>
  );
}
