import RelationshipButton from "./RelationshipButton";

export default function SearchResultCard({

    user,

    sending,

    onSend,

    onAccept,

    onReject,

    onCancel

}) {

    return (

        <div className="flex items-center justify-between gap-4 p-4 border rounded-2xl hover:bg-slate-50 transition">

            <div className="flex items-center gap-4 min-w-0">

                <div className="relative">

                    <div
                        className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold"
                    >
                        {user.fullName.charAt(0).toUpperCase()}
                    </div>

                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.online
                                ? "bg-green-500"
                                : "bg-gray-400"
                        }`}
                    />
                </div>

                <div className="min-w-0">

                    <h3 className="font-semibold truncate">

                        {user.fullName}

                    </h3>

                    <p className="text-sm text-slate-500 truncate">

                        {user.profession || "No Profession"}

                    </p>

                </div>

            </div>

            <RelationshipButton

                user={user}

                sending={sending}

                onSend={onSend}

                onAccept={onAccept}

                onReject={onReject}

                onCancel={onCancel}

            />

        </div>

    );

}