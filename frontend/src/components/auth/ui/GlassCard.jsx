import { motion } from "framer-motion";
import clsx from "clsx";

export default function GlassCard({
    children,
    className = ""
}) {
    return (
        <motion.div
            className={clsx("glass-card", className)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
        >
            <div className="glass-highlight" />

            {children}
        </motion.div>
    );
}