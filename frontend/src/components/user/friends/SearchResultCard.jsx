import RelationshipButton from "./RelationshipButton";
import Avatar from "../../ui/Avatar";

export default function SearchResultCard({

    user,

    sending,

    onSend,

    onAccept,

    onReject,

    onCancel

}) {

    return (

        <div className="flex items-center justify-between gap-4 p-4 border border-[var(--border)] rounded-2xl hover:bg-[var(--row-hover)] transition">

            <div className="flex items-center gap-4 min-w-0">

<div className="relative">

                    <div
                        className="w-14 h-14 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center text-xl font-bold overflow-hidden"
                    >
                        <Avatar
                            name={user.fullName}
                            src={user.profilePicture}
                            fill
                        />
                    </div>

                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--card)] ${
                            user.online
                                ? "bg-[var(--success)]"
                                : "bg-[var(--text-secondary)]"
                        }`}
                    />
                </div>

                <div className="min-w-0">

                    <h3 className="font-semibold truncate">

                        {user.fullName}

                    </h3>

                    <p className="text-sm text-[var(--text-secondary)] truncate">

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
