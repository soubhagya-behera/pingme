import { motion, useReducedMotion } from "framer-motion";
import { MessagesSquare, UserPlus, UserRoundPlus } from "lucide-react";

const STEPS = [
    {
        icon: UserRoundPlus,
        title: "Create your account",
        text: "Sign up with your email in seconds. Verify with the activation link and your secure PingMe identity is ready."
    },
    {
        icon: UserPlus,
        title: "Connect with people",
        text: "Search for friends by email, send requests and build your circle. Accept requests and see when they come online."
    },
    {
        icon: MessagesSquare,
        title: "Start chatting in real time",
        text: "Open any conversation and talk instantly — messages, voice notes, files and calls, all flowing live."
    }
];

export default function HowItWorks() {
    const reduced = useReducedMotion();

    const reveal = (delay = 0) => ({
        initial: reduced ? false : { opacity: 0, y: 34 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-70px" },
        transition: { duration: reduced ? 0 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }
    });

    return (
        <section className="lp-section" id="how-it-works" aria-labelledby="how-title">
            <div className="lp-section-head" {...reveal()}>
                <span className="lp-kicker"><span className="lp-kicker-dot" />How it works</span>
                <h2 className="lp-title" id="how-title">
                    Three steps to your <em>first ping</em>
                </h2>
            </div>

            <div className="lp-steps">
                {STEPS.map((step, index) => (
                    <motion.article className="lp-card lp-step" key={step.title} {...reveal(index * 0.12)}>
                        <span className="lp-step-num" aria-hidden="true" />
                        <span className="lp-step-art"><step.icon size={23} /></span>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
