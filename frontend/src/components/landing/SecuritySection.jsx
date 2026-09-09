import { motion, useReducedMotion } from "framer-motion";
import {
    KeyRound,
    MailCheck,
    ShieldCheck,
    UserCog,
    Waypoints
} from "lucide-react";

/* Security claims are limited to what PingMe's backend actually implements:
   Spring Security + stateless JWT, BCrypt hashing, role-based access,
   authenticated WebSocket handshake and email activation/reset flows. */

const MEASURES = [
    {
        icon: KeyRound,
        title: "JWT session tokens",
        text: "Every API request is verified against a signed JSON Web Token. No server-side sessions — tokens are validated on each call."
    },
    {
        icon: ShieldCheck,
        title: "BCrypt password hashing",
        text: "Passwords are never stored in plain text. They are salted and hashed with BCrypt before they ever touch the database."
    },
    {
        icon: Waypoints,
        title: "Authenticated realtime channel",
        text: "WebSocket connections complete a JWT handshake before any message can flow through the STOMP broker."
    },
    {
        icon: UserCog,
        title: "Role-based access control",
        text: "Administrative APIs are locked to admin authorities; user endpoints require authentication by default — nothing is public unless it must be."
    },
    {
        icon: MailCheck,
        title: "Email activation & recovery",
        text: "New accounts activate through emailed verification links, and password resets use single-purpose expiring tokens."
    }
];

export default function SecuritySection() {
    const reduced = useReducedMotion();

    const reveal = (delay = 0) => ({
        initial: reduced ? false : { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-70px" },
        transition: { duration: reduced ? 0 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }
    });

    return (
        <section className="lp-section" id="security" aria-labelledby="security-title">
            <div className="lp-security-grid">
                <motion.div className="lp-shield-visual" {...reveal()} aria-hidden="true">
                    <span className="lp-shield-orbit" />
                    <span className="lp-shield-core">
                        <ShieldCheck size={64} strokeWidth={1.5} />
                    </span>
                </motion.div>

                <div>
                    <div className="lp-section-head" style={{ marginBottom: 30 }} {...reveal()}>
                        <span className="lp-kicker"><span className="lp-kicker-dot" />Security</span>
                        <h2 className="lp-title" id="security-title" style={{ fontSize: "clamp(28px,3.6vw,40px)" }}>
                            Built on a <em>verified foundation</em>
                        </h2>
                        <p className="lp-subtitle">
                            PingMe protects your account with proven, industry-standard
                            mechanisms — no vague promises, just real architecture.
                        </p>
                    </div>

                    <ul className="lp-shield-list">
                        {MEASURES.map((item, index) => (
                            <motion.li className="lp-shield-item" key={item.title} {...reveal(index * 0.08)}>
                                <item.icon size={20} />
                                <span>
                                    <b>{item.title}</b>
                                    <p>{item.text}</p>
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
  );
}
