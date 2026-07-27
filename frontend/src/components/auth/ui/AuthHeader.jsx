import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function AuthHeader({
    title,
    subtitle,
    info = "Built with JWT authentication and Spring Security."
}) {

    return (

        <motion.div
            className="auth-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4 }}
        >

            <h1 className="login-title">

                {title}

            </h1>

            <p className="login-subtitle">

                {subtitle}

            </p>

            <div className="login-security">

                <ShieldCheck size={15}/>

                <span>

                    {info}

                </span>

            </div>

        </motion.div>

    );

}