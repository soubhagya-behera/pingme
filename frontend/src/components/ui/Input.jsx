import clsx from "clsx";

export default function Input({
  label,
  icon,
  error,
  className = "",
  ...props
}) {
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
            "text-[var(--text)]",
            "placeholder:text-[var(--text-secondary)]",
            "outline-none",
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}