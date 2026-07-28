import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Heart, Mic, Send, Sparkles, UserPlus } from "lucide-react";

const floatTransition = (duration, delay = 0) => ({
  duration,
  delay,
  repeat: Infinity,
  repeatType: "mirror",
  ease: [0.45, 0, 0.55, 1],
});

function FloatingPanel({ className, children, duration, delay, reducedMotion }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14, scale: .96 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [0, -8, 0], rotate: [0, .45, 0] }}
      transition={reducedMotion ? { duration: .25 } : { ...floatTransition(duration, delay), opacity: { duration: .48, delay } }}
    >
      {children}
    </motion.div>
  );
}

function Avatar({ className, letter }) {
  return <span className={`join-avatar ${className}`}>{letter}</span>;
}

export default function JoiningIllustration() {
  const reducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const updateTilt = (event) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientX - bounds.left) / bounds.width - .5) * 3.2,
      y: ((event.clientY - bounds.top) / bounds.height - .5) * -3.2,
    });
  };

  return (
    <motion.div
      className="joining-illustration"
      aria-hidden="true"
      onPointerMove={updateTilt}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{ rotateY: tilt.x, rotateX: tilt.y }}
      transition={{ type: "spring", stiffness: 52, damping: 18, mass: .85 }}
    >
      <div className="join-ambient join-ambient-one" />
      <div className="join-ambient join-ambient-two" />
      <div className="join-orbit join-orbit-one" />
      <div className="join-orbit join-orbit-two" />
      <svg className="join-connections" viewBox="0 0 660 610" role="presentation">
        <path d="M77 155C164 95 250 123 286 219M390 135c72 10 108 48 111 110M75 414c57-25 103-18 146 9M420 425c48-33 89-37 132-10" />
        <circle cx="77" cy="155" r="3" /><circle cx="286" cy="219" r="3" /><circle cx="390" cy="135" r="3" /><circle cx="501" cy="245" r="3" /><circle cx="75" cy="414" r="3" />
      </svg>

      <FloatingPanel className="join-chat-preview" duration={7.1} delay={.1} reducedMotion={reducedMotion}>
        <Avatar className="join-avatar-rose" letter="S" />
        <span><b>Sarah</b><small>Welcome to the circle!</small></span><span className="join-now">now</span>
      </FloatingPanel>

      <FloatingPanel className="join-friend-request" duration={6.5} delay={.28} reducedMotion={reducedMotion}>
        <Avatar className="join-avatar-cyan" letter="A" />
        <span><b>New friend request</b><small>Alex wants to connect</small></span>
        <span className="join-request-actions"><i><Check size={12} /></i><i>×</i></span>
      </FloatingPanel>

      <FloatingPanel className="join-online-stack" duration={7.4} delay={.45} reducedMotion={reducedMotion}>
        <span className="join-avatars"><Avatar className="join-avatar-amber" letter="M" /><Avatar className="join-avatar-cyan" letter="J" /><Avatar className="join-avatar-rose" letter="S" /><em>+12</em></span>
        <small><i />24 people online</small>
      </FloatingPanel>

      <FloatingPanel className="join-notification-card" duration={6.2} delay={.2} reducedMotion={reducedMotion}>
        <span className="join-notification-icon"><UserPlus size={16} /></span><span><b>Profile ready</b><small>One step closer</small></span><em>1</em>
      </FloatingPanel>

      <FloatingPanel className="join-typing-card" duration={6.7} delay={.6} reducedMotion={reducedMotion}>
        <Avatar className="join-avatar-amber" letter="J" /><span><b>Jamie</b><small>Typing<span className="join-typing-dots"><i /><i /><i /></span></small></span>
      </FloatingPanel>

      <FloatingPanel className="join-voice-pill" duration={5.8} delay={.3} reducedMotion={reducedMotion}>
        <Mic size={15} /><span className="join-voice-bars"><i /><i /><i /><i /><i /></span><small>0:18</small>
      </FloatingPanel>
      <FloatingPanel className="join-heart-reaction" duration={5.2} delay={.5} reducedMotion={reducedMotion}><Heart size={18} fill="currentColor" /></FloatingPanel>
      <FloatingPanel className="join-send-orb" duration={6} delay={.12} reducedMotion={reducedMotion}><Send size={17} /></FloatingPanel>

      <motion.div
        className="joining-woman-scene"
        initial={{ opacity: 0, y: 20, scale: .97 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: [0, -4, 0], scale: 1 }}
        transition={reducedMotion ? { duration: .25 } : { ...floatTransition(7.6), opacity: { duration: .7 }, scale: { duration: .7 } }}
      >
        <svg className="joining-woman-art" viewBox="0 0 520 540" role="presentation">
          <defs>
            <linearGradient id="join-jacket" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c4b5fd" /><stop offset="1" stopColor="#6d28d9" /></linearGradient>
            <linearGradient id="join-chair" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#312e81" /></linearGradient>
            <linearGradient id="join-skin" x1="0" x2="1"><stop stopColor="#f7cdb8" /><stop offset="1" stopColor="#d99177" /></linearGradient>
            <linearGradient id="join-hair" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#1e163f" /><stop offset=".55" stopColor="#4c1d95" /><stop offset="1" stopColor="#17122e" /></linearGradient>
          </defs>
          <ellipse cx="258" cy="505" rx="203" ry="25" fill="#020617" opacity=".4" />
          <path d="M72 418c2-106 39-172 126-182 77-9 150 41 165 139l-50 44H119z" fill="url(#join-chair)" opacity=".95" />
          <path d="M111 429c-18-61-10-126 20-151 34-28 77-13 89 38l-21 138z" fill="#5b21b6" /><path d="M337 423c23-66 16-123-14-151-30-27-72-14-86 35l15 144z" fill="#312e81" />
          <path d="M116 455h238l-23 21H139z" fill="#211747" /><path d="M150 470l-11 52M318 470l13 52" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round" />
          <path d="M185 307c-6-63 27-108 80-111 57-3 99 39 105 111l-25 63H210z" fill="url(#join-jacket)" />
          <path d="M238 207h51l13 68h-80z" fill="url(#join-skin)" />
          <path d="M198 280c21-16 47-18 71-4l-19 57-70-16zM347 276c-21-16-45-17-68-1l17 56 69-17z" fill="url(#join-skin)" />
          <path d="M192 320c45 13 99 13 153-2l10 56H182z" fill="#ede9fe" opacity=".9" />
          <path d="M208 367c-45 8-77 35-96 76h153l-1-76zM286 368c46 5 80 30 102 75H244l42-75z" fill="#1e1b4b" />
          <path d="M109 434h155v23H91c1-12 7-20 18-23zM242 434h151c12 3 18 11 19 23H239z" fill="#ddd6fe" />
          <path d="M210 136c0-56 32-93 78-93 50 0 84 39 78 96-5 43-30 74-78 74-49 0-78-34-78-77z" fill="url(#join-skin)" />
          <path d="M205 137c-7-62 27-105 81-107 51-1 88 39 81 93-20-12-38-35-47-64-23 37-58 58-115 63z" fill="url(#join-hair)" />
          <path d="M213 115c-19 10-27 30-22 49 4 16 15 28 27 32M359 117c17 9 24 28 20 47-4 15-13 25-25 30" fill="url(#join-skin)" />
          <ellipse cx="248" cy="145" rx="4.5" ry="5.5" fill="#251946" /><ellipse cx="319" cy="145" rx="4.5" ry="5.5" fill="#251946" /><path d="M264 179c11 8 25 8 37 0" fill="none" stroke="#9b5e5c" strokeWidth="3" strokeLinecap="round" />
          <path d="M198 291c18-15 43-16 67-3l-18 48-66-14z" fill="url(#join-skin)" />
          <g transform="rotate(-6 285 300)"><rect x="251" y="255" width="136" height="88" rx="12" fill="#111827" stroke="#c4b5fd" strokeWidth="4" /><rect x="261" y="266" width="116" height="64" rx="8" fill="#f5f3ff" /><circle cx="281" cy="292" r="12" fill="#a78bfa" /><path d="M300 284h48M300 295h38M300 306h30" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" /></g>
          <g transform="rotate(12 363 236)"><rect x="347" y="190" width="46" height="82" rx="10" fill="#131827" stroke="#f5d0fe" strokeWidth="3" /><rect x="353" y="199" width="34" height="56" rx="6" fill="#ede9fe" /><circle cx="370" cy="262" r="3" fill="#a78bfa" /><path d="M361 214h18M361 222h13" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" /></g>
          <path d="M339 280c14-10 30-8 43 4l-12 30-35-11z" fill="url(#join-skin)" />
        </svg>
        <span className="join-verified"><Check size={13} /></span>
      </motion.div>
      <span className="join-caption"><i />Your community is ready</span>
      <Sparkles className="join-sparkle" size={16} />
    </motion.div>
  );
}
