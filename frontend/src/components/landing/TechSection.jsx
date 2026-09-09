import { motion, useReducedMotion } from "framer-motion";
import { Cpu } from "lucide-react";

/* Stack reflects the real project: React + Spring Boot + WebSocket/STOMP
   + WebRTC calls + MySQL persistence (see architecture.md). */

const STACK = [
    "React",
    "Spring Boot",
    "Spring Security",
    "WebSocket / STOMP",
    "WebRTC",
    "MySQL",
    "JWT"
];

export default function TechSection() {
    const reduced = useReducedMotion();

    return (
        <section className="lp-section" id="about" aria-labelledby="tech-title">
            <div className="lp-section-head" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}
                {...(reduced ? {} : {
                    initial: { opacity: 0, y: 26 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: "-70px" },
                    transition: { duration: 0.65 }
                })}
            >
                <span className="lp-kicker"><span className="lp-kicker-dot" />About the platform</span>
                <h2 className="lp-title" id="tech-title" style={{ fontSize: "clamp(28px,3.6vw,40px)" }}>
                    Built for <em>real-time communication</em>
                </h2>
                <p className="lp-subtitle">
                    Under the hood, PingMe pairs a responsive React interface with a Spring
                    Boot backend. Messages ride a persistent STOMP-over-WebSocket channel,
                    calls negotiate peer-to-peer with WebRTC, and data lives in MySQL.
                </p>
            </div>

            <div className="lp-tech-strip">
                {STACK.map((tech, index) => (
                    <motion.span
                        className="lp-tech-chip"
                        key={tech}
                        {...(reduced ? {} : {
                            initial: { opacity: 0, scale: 0.9 },
                            whileInView: { opacity: 1, scale: 1 },
                            viewport: { once: true },
                            transition: { duration: 0.4, delay: index * 0.06 }
                        })}
                    >
                        <Cpu size={13} />
                        {tech}
                    </motion.span>
                ))}
            </div>

            <p className="lp-tech-note">
                The stack is quiet on purpose — you came here to talk, not to configure.
            </p>
        </section>
    );
}
