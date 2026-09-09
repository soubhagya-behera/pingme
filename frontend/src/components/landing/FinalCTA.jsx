import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
    const reduced = useReducedMotion();

    return (
        <div className="lp-final" id="get-started">
            <motion.div
                className="lp-final-panel"
                initial={reduced ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <span className="lp-final-sun" aria-hidden="true" />
                <h2>Ready to start the conversation?</h2>
                <p>
                    Create your PingMe account and start connecting in real time —
                    it only takes a minute.
                </p>
                <Link to="/login" className="lp-btn lp-btn-primary">
                    Start Chatting
                    <ArrowRight size={17} strokeWidth={2.5} />
                </Link>
            </motion.div>
        </div>
    );
}
