import { motion, useReducedMotion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";
import AnimatedBackground from "../layout/AnimatedBackground";
import MessagingIllustration from "./MessagingIllustration";

export default function AuthLayout({ children }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="auth-shell">
      <AnimatedBackground />

      <motion.aside
        className="auth-left"
        initial={reducedMotion ? false : { opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        aria-label="PingMe introduction"
      >
        <MessagingIllustration />
        <div className="brand brand-under-illustration">
          <div className="brand-logo" aria-hidden="true"><MessageCircleMore size={25} /></div>
          <div>
            <span>PingMe</span>
            <p>Modern Messaging Platform</p>
          </div>
        </div>
      </motion.aside>

      <motion.main
        className="auth-right"
        initial={reducedMotion ? false : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-mobile-intro" aria-hidden="true">
          <div className="auth-mobile-brandmark"><MessageCircleMore size={21} /></div>
          <span className="auth-mobile-brandname">PingMe</span>
          <motion.span className="auth-mobile-message" animate={reducedMotion ? { opacity: 1 } : { y: [0, -3, 0], opacity: [0.68, 1, 0.68] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}>A calmer way to connect</motion.span>
        </div>
        {children}
      </motion.main>
    </div>
  );
}
