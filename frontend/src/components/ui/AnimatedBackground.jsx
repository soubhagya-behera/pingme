import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <>
      {/* Background Gradient */}
      <div className="auth-background-gradient" />

      {/* Grid Overlay */}
      <div className="auth-grid" />

      {/* Animated Blur Circle 1 */}
      <motion.div
        className="auth-blob auth-blob-one"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Blur Circle 2 */}
      <motion.div
        className="auth-blob auth-blob-two"
        animate={{
          x: [0, -50, 20, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Blur Circle 3 */}
      <motion.div
        className="auth-blob auth-blob-three"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}