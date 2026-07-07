import clsx from "clsx";

const variants = {

primary:
"bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white",

secondary:
"bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:opacity-90",

danger:
"bg-red-500 hover:bg-red-600 text-white",

ghost:
"bg-transparent text-[var(--text)] hover:bg-[var(--border)]"

};

export default function Button({

    children,

    variant = "primary",

    className = "",

    ...props

}) {

    return (

        <button

            className={clsx(

                "rounded-xl px-5 py-3",

                "font-medium",

                "transition-all duration-300",

                "hover:scale-[1.02]",

                "active:scale-95",

                "shadow-sm",

                variants[variant],

                className

            )}

            {...props}

        >

            {children}

        </button>

    );

}