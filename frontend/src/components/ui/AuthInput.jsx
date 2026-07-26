import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  label,
  icon,
  error,
  className = "",
  type = "text",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <motion.div
      className="auth-input-wrapper"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <label className="auth-floating-label">
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