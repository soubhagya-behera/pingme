import "./RegisterSuccess.css";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock3, MailCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/layout/AuthLayout";
import GlassCard from "../../components/auth/ui/GlassCard";

export default function RegisterSuccess() {
  const reducedMotion = useReducedMotion();

  return (
    <AuthLayout>
      <GlassCard className="success-auth-card">
        <motion.div
          className="success-check-orbit"
          initial={reducedMotion ? false : { opacity: 0, scale: .76 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .55, ease: [0.16, 1, .3, 1] }}
        >
          <motion.div
            className="success-check"
            animate={reducedMotion ? { rotate: 0 } : { y: [0, -4, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          ><Check size={31} strokeWidth={3} /></motion.div>
        </motion.div>

        <div className="success-heading">
          <span className="success-kicker">PROFILE SUBMITTED</span>
          <h1>You're on the list.</h1>
          <p>Thanks for joining <strong>PingMe</strong>. We’re preparing your space to connect.</p>
        </div>

        <section className="approval-panel" aria-label="Account approval status">
          <div className="approval-panel-header">
            <span className="approval-icon"><Clock3 size={17} /></span>
            <div><span>Current status</span><strong>Pending approval</strong></div>
            <span className="approval-pulse" aria-label="Approval pending" />
          </div>

          <ol className="approval-timeline">
            <li className="timeline-complete"><span><Check size={12} /></span><div><strong>Profile received</strong><small>Your details are safely in our queue.</small></div></li>
            <li className="timeline-current"><span><Clock3 size={12} /></span><div><strong>Quick review</strong><small>Our team is checking your profile.</small></div></li>
            <li><span><MailCheck size={12} /></span><div><strong>Activation email</strong><small>We’ll email you as soon as you’re ready.</small></div></li>
          </ol>
        </section>

        <p className="success-estimate"><ShieldCheck size={15} />Usually approved within one business day.</p>
        <Link to="/login" className="success-login-link">Back to Login</Link>
        <p className="success-help">Need a hand? <a href="mailto:support@pingme.com">support@pingme.com</a></p>
      </GlassCard>
    </AuthLayout>
  );
}
