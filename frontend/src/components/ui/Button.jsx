import clsx from "clsx";

const variants = {

    primary:
        "bg-indigo-600 hover:bg-indigo-700 text-white",

    secondary:
        "bg-white border border-slate-300 hover:bg-slate-100 text-slate-900",

    danger:
        "bg-red-500 hover:bg-red-600 text-white",

    ghost:
        "bg-transparent hover:bg-slate-100 text-slate-700"

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