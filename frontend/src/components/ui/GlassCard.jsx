import { motion } from "framer-motion";
import clsx from "clsx";

export default function GlassCard({
  children,
  className = "",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 35,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -3,
      }}
      className={clsx("glass-card", className)}
    >
      {children}

      {/* Decorative border glow */}
      <div className="glass-highlight"></div>
    </motion.div>
  );
}