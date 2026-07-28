import { motion, useReducedMotion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";
import AnimatedBackground from "../layout/AnimatedBackground";
import MessagingIllustration from "./MessagingIllustration";

export default function AuthLayout({ children, illustration: Illustration = MessagingIllustration, mobileMessage = "A calmer way to connect", className = "" }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`auth-shell ${className}`}>
      <AnimatedBackground />

      <motion.aside
        className="auth-left"
        initial={reducedMotion ? false : { opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        aria-label="PingMe introduction"
      >
        <Illustration />
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
          <motion.span
            className="auth-mobile-bubble auth-mobile-bubble-one"
            animate={reducedMotion ? { opacity: 1 } : { y: [0, -5, 0], opacity: [0.62, 1, 0.62] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
          >Hey there</motion.span>
          <motion.span
            className="auth-mobile-bubble auth-mobile-bubble-two"
            animate={reducedMotion ? { opacity: 1 } : { y: [0, 5, 0], opacity: [0.55, .92, .55] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          ><span className="mobile-bubble-dot" /><span className="mobile-bubble-dot" /><span className="mobile-bubble-dot" /></motion.span>
          <motion.span
            className="auth-mobile-bubble auth-mobile-bubble-three"
            animate={reducedMotion ? { opacity: 1 } : { y: [0, -4, 0], opacity: [0.52, .9, .52] }}
            transition={{ duration: 4.9, repeat: Infinity, ease: "easeInOut" }}
          >♡</motion.span>
          <div className="auth-mobile-brandmark"><MessageCircleMore size={21} /></div>
          <span className="auth-mobile-brandname">PingMe</span>
          <motion.span className="auth-mobile-message" animate={reducedMotion ? { opacity: 1 } : { y: [0, -2, 0], opacity: [0.68, 1, 0.68] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}>{mobileMessage}</motion.span>
        </div>
        {children}
      </motion.main>
    </div>
  );
}
