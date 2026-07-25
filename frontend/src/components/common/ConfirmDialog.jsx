import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({

    open,

    title,

    message,

    confirmText = "Confirm",

    cancelText = "Cancel",

    confirmVariant = "danger",

    onConfirm,

    onCancel

}) {

    if (!open) {

        return null;

    }

    return (

        <div
            className="
                fixed
                inset-0
                z-[9999]
                bg-black/50
                backdrop-blur-sm
                flex
                items-center
                justify-center
                p-4
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-2xl
                    bg-white
                    shadow-2xl
                    animate-in
                    fade-in
                    zoom-in-95
                "
            >

                {/* Header */}

                <div className="flex items-center gap-3 p-6 border-b">

                    <div
                        className="
                            w-12
                            h-12
                            rounded-full
                            bg-red-100
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <AlertTriangle
                            className="text-red-600"
                        />

                    </div>

                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                            "
                        >

                            {title}

                        </h2>

                    </div>

                </div>

                {/* Message */}

                <div className="px-6 py-5">

                    <p className="text-slate-600">

                        {message}

                    </p>

                </div>

                {/* Footer */}

                <div
                    className="
                        flex
                        justify-end
                        gap-3
                        px-6
                        pb-6
                    "
                >

                    <button

                        onClick={onCancel}

                        className="
                            rounded-xl
                            border
                            px-5
                            py-2.5
                            hover:bg-slate-100
                        "

                    >

                        {cancelText}

                    </button>

                    <button

                        onClick={onConfirm}

                        className={`
                            rounded-xl
                            px-5
                            py-2.5
                            text-white
                            transition
                            ${
                                confirmVariant === "danger"

                                ?

                                "bg-red-600 hover:bg-red-700"

                                :

                                "bg-indigo-600 hover:bg-indigo-700"

                            }
                        `}

                    >

                        {confirmText}

                    </button>

                </div>

            </div>

        </div>

    );

}