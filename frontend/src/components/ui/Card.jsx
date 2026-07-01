import clsx from "clsx";

export default function Card({

    children,

    className = "",

    hover = false,

    ...props

}) {

    return (

        <div

            className={clsx(

                "rounded-3xl",

                "bg-white",

                "border border-slate-200",

                "shadow-sm",

                "transition-all duration-300",

                hover &&

                "hover:-translate-y-1 hover:shadow-xl",

                className

            )}

            {...props}

        >

            {children}

        </div>

    );

}