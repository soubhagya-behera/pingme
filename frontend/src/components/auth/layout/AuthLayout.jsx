import { motion } from "framer-motion";
import AnimatedBackground from "../layout/AnimatedBackground";
import { MessageCircleMore } from "lucide-react";

export default function AuthLayout({
  children,
  heroTitle = "Fast. Secure. Beautiful.",
  heroSubtitle =
    "Experience real-time conversations with modern UI, lightning fast performance, and enterprise-grade security.",
  badge = "Modern Messaging Platform",
}) {
  return (
    <div className="auth-shell">

      <AnimatedBackground />

      {/* LEFT PANEL */}

      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: .6 }}
      >

        <div className="brand">

          <div className="brand-logo">

<MessageCircleMore size={28}/>

</div>

          <span>PingMe</span>

        </div>

        <div className="hero">

          <span className="hero-badge">

            {badge}

          </span>

          <h1>

            {heroTitle}

          </h1>

          <p>

            {heroSubtitle}

          </p>

        </div>

        {/* Fake Chat Preview */}

        <div className="chat-preview">

          <div className="chat-header">

            <div className="online-dot"></div>

            Dev Team

          </div>

          <div className="message">

            Hey! Did you push the latest update?

          </div>

          <div className="message own">

            Yes 🚀 Everything is deployed.

          </div>

          <div className="typing">

            <span></span>

            <span></span>

            <span></span>

          </div>

        </div>

      </motion.div>

      {/* RIGHT PANEL */}

      <motion.div
        className="auth-right"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: .6 }}
      >

        {children}

      </motion.div>

    </div>
  );
}