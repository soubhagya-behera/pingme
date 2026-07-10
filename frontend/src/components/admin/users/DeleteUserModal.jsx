import Button from "../../ui/Button";
import Card from "../../ui/Card";

export default function DeleteUserModal({

    open,
    user,
    loading,
    onClose,
    onConfirm

}) {

    if (!open || !user) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <Card className="w-full max-w-md p-6">

                <h2 className="text-2xl font-bold">

                    Delete User

                </h2>

                <p className="mt-3 text-[var(--text-secondary)]">

                    Are you sure you want to permanently delete

                    <span className="font-semibold">

                        {" "}
                        {user.fullName}

                    </span>

                    ?

                </p>

                <div className="mt-8 flex justify-end gap-3">

                    <Button

                        variant="secondary"

                        onClick={onClose}

                    >

                        Cancel

                    </Button>

                    <Button

                        variant="danger"

                        disabled={loading}

                        onClick={onConfirm}

                    >

                        Delete

                    </Button>

                </div>

            </Card>

        </div>

    );

}