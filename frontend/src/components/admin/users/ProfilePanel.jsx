import {
    CheckCircle2,
    Mail,
    Trash2,
    XCircle
} from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import ProfileField from "./ProfileField";
import EmptyState from "./EmptyState";

import { UserRound } from "lucide-react";

export default function ProfilePanel({

    user,

    actionLoading,

    onAction

}){

    if(!user){

        return(

            <Card className="rounded-lg p-6">

                <EmptyState
                    icon={UserRound}
                    title="No profile selected"
                    description="Select a user from the table."
                />

            </Card>

        );

    }

    return(

        <Card className="rounded-lg p-6">

            <div className="flex flex-wrap items-start justify-between gap-4">

                <div className="flex min-w-0 flex-1 items-center gap-4">

                    <UserAvatar
                        name={user.fullName}
                        size="large"
                    />

                    <div className="min-w-0">

                        <h2 className="truncate text-xl font-semibold">

                            {user.fullName}

                        </h2>

                        <p className="truncate text-sm text-[var(--text-secondary)]">

                            {user.email}

                        </p>

                    </div>

                </div>

                <StatusBadge status={user.status}/>

            </div>

            <div className="mt-6 space-y-4 text-sm">

                <ProfileField
                    label="Profession"
                    value={user.profession || "Not provided"}
                />

                <ProfileField
                    label="Phone"
                    value={user.phone || "Not provided"}
                />

                <ProfileField
                    label="Bio"
                    value={user.bio || "No bio added yet"}
                />

                <ProfileField
                    label="Joined"
                    value={formatDate(user.createdAt)}
                />

                <ProfileField
                    label="Last Seen"
                    value={formatDate(user.lastSeen)}
                />

                <ProfileField
                    label="Email Verified"
                    value={user.emailVerified ? "Yes" : "No"}
                />

                <ProfileField
                    label="Online"
                    value={user.online ? "Online" : "Offline"}
                />

            </div>

            <div className="mt-6 grid gap-3">

                {

                    user.status === "PENDING" &&

                    <>

                        <Button

                            className="flex items-center justify-center gap-2"

                            disabled={actionLoading===`approve-${user.id}`}

                            onClick={()=>onAction(user,"approve")}

                        >

                            <CheckCircle2 size={18}/>

                            Approve

                        </Button>

                        <Button

                            variant="danger"

                            className="flex items-center justify-center gap-2"

                            disabled={actionLoading===`reject-${user.id}`}

                            onClick={()=>onAction(user,"reject")}

                        >

                            <XCircle size={18}/>

                            Reject

                        </Button>

                    </>

                }

                {

                    user.status==="APPROVED" &&

                    !user.emailVerified &&

                    <Button

                        className="flex items-center justify-center gap-2"

                        disabled={actionLoading===`resend-${user.id}`}

                        onClick={()=>onAction(user,"resend")}

                    >

                        <Mail size={18}/>

                        Resend Activation Email

                    </Button>

                }

                {

                    user.status==="REJECTED" &&

                    <Button

                        className="flex items-center justify-center gap-2"

                        disabled={actionLoading===`approve-${user.id}`}

                        onClick={()=>onAction(user,"approve")}

                    >

                        <CheckCircle2 size={18}/>

                        Approve User

                    </Button>

                }

                <Button

                    variant="danger"

                    className="flex items-center justify-center gap-2"

                    disabled={actionLoading===`delete-${user.id}`}

                    onClick={()=>onAction(user,"delete")}

                >

                    <Trash2 size={18}/>

                    Delete User

                </Button>

            </div>

        </Card>

    );

}

function formatDate(value){

    if(!value){

        return "Not available";

    }

    return new Intl.DateTimeFormat(

        "en",

        {

            month:"short",

            day:"numeric",

            year:"numeric"

        }

    ).format(

        new Date(value)

    );

}