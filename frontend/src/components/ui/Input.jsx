import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  icon,
  error,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      )}

      <div
        className={clsx(
          "flex items-center",
          "rounded-2xl",
          "border",
          "px-4 py-3",
          "transition-all duration-300",
          "bg-[var(--card)]",
          "border-[var(--border)]",
          "focus-within:border-[var(--primary)]",
          "focus-within:ring-4",
          "focus-within:ring-indigo-300/20"
        )}
      >
        {icon && (
          <span className="mr-3 text-[var(--text-secondary)]">
            {icon}
          </span>
        )}

        <input
          className={clsx(
            "w-full",
            "bg-transparent",
            "border-0",
            "outline-none",
            "ring-0",
            "shadow-none",
            "appearance-none",
            "focus:border-0",
            "focus:outline-none",
            "focus:ring-0",
            "text-[var(--text)]",
            "placeholder:text-[var(--text-secondary)]",
            className
          )}
          {...props}
          type={isPassword ? (showPassword ? "text" : "password") : props.type}
        />

        {isPassword && (
          <button
  type="button"
  onMouseDown={(e) => e.preventDefault()}
  onClick={() => setShowPassword(!showPassword)}
  aria-label={
    showPassword ? "Hide password" : "Show password"
  }
  className="ml-3 rounded-full p-1 text-[var(--text-secondary)] hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700 transition"
>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}