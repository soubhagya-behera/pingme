import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    Compass,
    LayoutDashboard,
    MessageCircle,
    Radio,
    ShieldCheck,
    Zap
} from "lucide-react";

import HeroScene from "./HeroScene";
import { useAuth } from "../../context/AuthContext";

function formatClock(totalSeconds) {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

const SIGNS = [
    { label: "REAL-TIME", icon: Zap, style: { top: "24%", left: "9%", "--float-dur": "8.5s" }, accent: "#67e8f9" },
    { label: "CONNECT", icon: Radio, style: { top: "38%", right: "7%", "--float-dur": "10s", "--float-delay": ".8s" }, accent: "#f472b6" },
    { label: "ONLINE", icon: MessageCircle, style: { top: "58%", left: "12%", "--float-dur": "9.2s", "--float-delay": "1.6s" }, accent: "#34d399" }
];

export default function HeroContent() {
    const parallaxRef = useRef(null);
    const heroRef = useRef(null);
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const reduced = useReducedMotion();
    const { token, user } = useAuth();
    const isAuthenticated = Boolean(token);
    const appHome = user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

    // Decorative session clock — clearly conceptual, not a backend health signal.
    useEffect(() => {
        const timer = setInterval(() => setSessionSeconds(value => value + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Occasional controlled tape-glitch + hero fade on scroll.
    useEffect(() => {
        if (reduced) return;

        let glitchTimer;
        const scheduleGlitch = () => {
            glitchTimer = setTimeout(() => {
                heroRef.current?.classList.add("is-glitching");
                setTimeout(() => heroRef.current?.classList.remove("is-glitching"), 320);
                scheduleGlitch();
            }, 5200 + Math.random() * 5200);
        };
        scheduleGlitch();

        const onScroll = () => {
            if (!heroRef.current) return;
            heroRef.current.classList.toggle(
                "is-leaving",
                window.scrollY > window.innerHeight * 0.28
            );
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            clearTimeout(glitchTimer);
            window.removeEventListener("scroll", onScroll);
        };
    }, [reduced]);

    return (
        <section className="lp-hero" ref={heroRef} aria-label="PingMe introduction">
            <HeroScene parallaxRef={parallaxRef} />

            <div className="lp-parallax lp-parallax-deep" ref={parallaxRef} aria-hidden="true">
                {/* Palm silhouettes */}
                <div className="lp-palm lp-palm-left">
                    <PalmSvg />
                </div>
                <div className="lp-palm lp-palm-right">
                    <PalmSvg />
                </div>

                {/* Rotating geometric beacon above the horizon */}
                <div className="lp-beacon">
                    <div className="lp-beacon-gem">
                        <GemSvg />
                    </div>
                </div>

                {/* Floating PingMe signage */}
                {SIGNS.map(sign => (
                    <span key={sign.label} className="lp-signage" style={sign.style}>
                        <sign.icon size={12} strokeWidth={2.4} style={{ color: sign.accent }} />
                        {sign.label}
                    </span>
                ))}
            </div>

            {/* Soft dark gradient keeping copy readable over the sunset */}
            <div className="lp-hero-scrim" aria-hidden="true" />

            <div className="lp-hero-content">
                <motion.p
                    className="lp-hero-badge"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduced ? 0 : 0.7, delay: 0.1 }}
                >
                    <span className="pulse-dot" aria-hidden="true" />
                    Enter the PingMe network
                </motion.p>

                <motion.h1
                    className="lp-hero-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduced ? 0 : 0.85, delay: 0.22 }}
                >
                    <span className="chrome">Your conversations.</span>
                    <span className="chrome">In real time.</span>
                </motion.h1>

                <motion.div
                    className="lp-hero-meta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 1, delay: 0.78 }}
                >
                    <span><Zap size={17} strokeWidth={2.2} /> Instant delivery</span>
                    <span><MessageCircle size={17} strokeWidth={2.2} /> Voice &amp; video calls</span>
                    <span><ShieldCheck size={17} strokeWidth={2.2} /> JWT-secured accounts</span>
                </motion.div>
            </div>

            <div className="lp-status-hud" aria-hidden="true">
                <span className="lp-status-row">
                    <span className="dot" />
                    PINGME NETWORK · ONLINE
                </span>
                <span className="lp-status-clock">{formatClock(sessionSeconds)}</span>
                <span>DECORATIVE SESSION CLOCK</span>
            </div>

            <div className="lp-scroll-cue" aria-hidden="true">
                SCROLL
            </div>

            <div className="lp-vignette" aria-hidden="true" />
            <div className="lp-scanlines lp-glitch-shift" aria-hidden="true" />
            <div className="lp-noise" aria-hidden="true" />
        </section>
    );
}

function PalmSvg() {
    return (
        <svg viewBox="0 0 200 260" fill="#020108" xmlns="http://www.w3.org/2000/svg">
            <path d="M96 260c-2-52 2-104 10-156l8-48h6l-4 54c-2 44-4 100 2 150z" />
            <path d="M112 60C88 34 52 26 22 40c26-4 52 4 74 24zM114 62C104 28 76 6 42 4c28 10 52 32 62 60zM118 64c22-26 58-36 90-26-28-2-56 10-76 30zM116 66c30-8 62 4 80 30-24-16-54-22-82-14zM110 68c-30 0-58 20-70 48 18-22 46-36 74-34z" />
            <path d="M113 66c8-30 32-52 62-58-24 12-44 34-50 62z" opacity=".92" />
        </svg>
    );
}

function GemSvg() {
    return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#d8ccff" strokeWidth="1.6" strokeLinejoin="round">
                <path fill="rgba(139,92,246,.28)" d="M60 6 108 60 60 114 12 60Z" />
                <path fill="rgba(103,232,249,.16)" d="M60 6l24 54-24 54-24-54z" />
                <path d="M12 60h96M60 6v108M36 60l24 54 24-54" opacity=".65" />
            </g>
            <circle cx="60" cy="60" r="5" fill="#e9d5ff">
                <animate attributeName="opacity" values="1;.35;1" dur="2.6s" repeatCount="indefinite" />
            </circle>
        </svg>
    );
}
