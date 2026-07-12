import Button from "../ui/Button";

export default function SearchResultCard({

    user,

    sending,

    onSend

}) {

    function renderButton() {

        switch (user.relationshipStatus) {

            case "NOT_FRIEND":

                return (

                    <Button

                        disabled={sending}

                        onClick={() => onSend(user)}

                    >

                        Add Friend

                    </Button>

                );

            case "PENDING_SENT":

                return (

                    <Button

                        variant="secondary"

                        disabled

                    >

                        Pending

                    </Button>

                );

            case "PENDING_RECEIVED":

                return (

                    <Button>

                        Accept

                    </Button>

                );

            case "FRIENDS":

                return (

                    <Button

                        variant="ghost"

                    >

                        Friends

                    </Button>

                );

            default:

                return null;

        }

    }

    return (

        <div className="flex items-center justify-between p-4 border rounded-2xl">

            <div className="flex items-center gap-4">

                <div

                    className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold"

                >

                    {user.fullName.charAt(0)}

                </div>

                <div>

                    <h3 className="font-semibold">

                        {user.fullName}

                    </h3>

                    <p className="text-sm text-slate-500">

                        {user.profession || "No Profession"}

                    </p>

                </div>

            </div>

            {renderButton()}

        </div>

    );

}