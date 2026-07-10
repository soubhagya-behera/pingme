import {
    CheckCircle2,
    Mail,
    Trash2,
    XCircle
} from "lucide-react";

import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import IconButton from "./IconButton";

export default function UserRow({

    user,

    selected,

    actionLoading,

    onSelect,

    onAction

}){

    return(

<tr
className={`
border-b border-[var(--border)]
transition-colors duration-200
${selected ? "selected-user-row" : "user-row"}
`}
>

<td className="px-5 py-4">

<button

className="flex items-center gap-3 text-left"

onClick={onSelect}

type="button"

>

<UserAvatar name={user.fullName}/>

<span>

<span className="block font-semibold text-[var(--text)]">

{user.fullName}

</span>

<span className="block text-sm text-[var(--text-secondary)]">

{user.email}

</span>

</span>

</button>

</td>

<td className="px-5 py-4 text-sm text-[var(--text-secondary)]">

{user.profession || "Not provided"}

</td>

<td className="px-5 py-4">

<StatusBadge status={user.status}/>

</td>

<td className="px-5 py-4 text-sm text-[var(--text-secondary)]">

{formatDate(user.createdAt)}

</td>

<td className="px-5 py-4">

<div className="flex justify-end gap-2">

{

user.status==="PENDING" &&

<>

<IconButton

title="Approve User"

loading={actionLoading===`approve-${user.id}`}

onClick={()=>onAction(user,"approve")}

>

<CheckCircle2 size={17}/>

</IconButton>

<IconButton

title="Reject User"

loading={actionLoading===`reject-${user.id}`}

onClick={()=>onAction(user,"reject")}

>

<XCircle size={17}/>

</IconButton>

</>

}

{

user.status==="APPROVED"

&&

!user.emailVerified

&&

<IconButton

title="Resend Activation Email"

loading={actionLoading===`resend-${user.id}`}

onClick={()=>onAction(user,"resend")}

>

<Mail size={17}/>

</IconButton>

}

{

user.status==="REJECTED"

&&

<IconButton

title="Approve User"

loading={actionLoading===`approve-${user.id}`}

onClick={()=>onAction(user,"approve")}

>

<CheckCircle2 size={17}/>

</IconButton>

}

<IconButton

danger

title="Delete User"

loading={actionLoading===`delete-${user.id}`}

onClick={()=>onAction(user,"delete")}

>

<Trash2 size={17}/>

</IconButton>

</div>

</td>

</tr>

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