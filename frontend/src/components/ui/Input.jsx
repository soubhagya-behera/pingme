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

                <label className="mb-2 block text-sm font-medium text-slate-700">

                    {label}

                </label>

            )}

            <div
                className={clsx(

                    "flex items-center",

                    "rounded-2xl",

                    "border border-slate-300",

                    "bg-white",

                    "px-4 py-3",

                    "transition-all duration-300",

                    "focus-within:border-indigo-600",

                    "focus-within:ring-4",

                    "focus-within:ring-indigo-100"

                )}
            >

                {icon && (

                    <span className="mr-3 text-slate-400">

                        {icon}

                    </span>

                )}

                <input

                    className={clsx(

                        "w-full",

                        "bg-transparent",

                        "outline-none",

                        "placeholder:text-slate-400",

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