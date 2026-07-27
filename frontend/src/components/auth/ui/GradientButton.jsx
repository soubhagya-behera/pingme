import { motion } from "framer-motion";
import clsx from "clsx";
import { Loader2, ArrowRight } from "lucide-react";

export default function GradientButton({
  children,
  loading = false,
  icon = true,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileHover={{
        y: -2,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.18,
      }}
      className={clsx(
        "gradient-btn",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="gradient-btn-spinner"
          />
          Signing In...
        </>
      ) : (
        <>
          {children}

          {icon && (
            <motion.div

whileHover={{

x:4

}}

>

<ArrowRight size={18}/>

</motion.div>
          )}
        </>
      )}
    </motion.button>
  );
}