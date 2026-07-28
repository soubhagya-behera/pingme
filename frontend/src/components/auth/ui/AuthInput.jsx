import { useId, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  label,
  icon,
  error,
  className = "",
  type = "text",
  entranceDelay = 0,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = props.id || generatedId;

  const isPassword = type === "password";

  return (
    <motion.div
      className="auth-input-wrapper"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: entranceDelay }}
    >
      <label className="auth-floating-label" htmlFor={inputId}>
        {label}
      </label>

      <div
        className={clsx(
          "auth-input-container",
          error && "auth-input-error"
        )}
      >
        {icon && (
          <span className="auth-input-left-icon">
            {icon}
          </span>
        )}

        <input
          className={clsx(
            "auth-input-field",
            className
          )}
          id={inputId}
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="auth-password-btn"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {error && (
        <motion.p
          className="auth-error-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
