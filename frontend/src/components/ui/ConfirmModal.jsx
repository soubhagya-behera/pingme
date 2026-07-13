import Card from "./Card";
import Button from "./Button";

export default function ConfirmModal({

    open,

    title,

    message,

    confirmText = "Confirm",

    cancelText = "Cancel",

    onConfirm,

    onCancel,

    loading = false

}) {

    if (!open) return null;

    return (

        <div className="modal-overlay">

            <Card className="confirm-modal">

                <h2 className="text-2xl font-bold">

                    {title}

                </h2>

                <p className="text-slate-500 mt-3">

                    {message}

                </p>

                <div className="flex justify-end gap-3 mt-8">

                    <Button

                        variant="secondary"

                        onClick={onCancel}

                    >

                        {cancelText}

                    </Button>

                    <Button

                        variant="danger"

                        disabled={loading}

                        onClick={onConfirm}

                    >

                        {confirmText}

                    </Button>

                </div>

            </Card>

        </div>

    );

}