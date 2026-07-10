import EmptyState from "./EmptyState";
import UserRow from "./UserRow";

export default function UsersTable({

    users,

    usersLoading,

    selectedUser,

    actionLoading,

    onSelect,

    onAction

}){

    return(

<div className="overflow-x-auto">

<table className="w-full min-w-[760px] text-left">

<thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-secondary)]">

<tr>

<th className="px-5 py-4 font-semibold">
User
</th>

<th className="px-5 py-4 font-semibold">
Profession
</th>

<th className="px-5 py-4 font-semibold">
Status
</th>

<th className="px-5 py-4 font-semibold">
Joined
</th>

<th className="px-5 py-4 text-right font-semibold">
Actions
</th>

</tr>

</thead>

<tbody>

{

usersLoading &&

<tr>

<td
colSpan="5"
className="px-5 py-10 text-center text-[var(--text-secondary)]"
>

Loading users...

</td>

</tr>

}

{

!usersLoading &&

users.length===0 &&

<tr>

<td
colSpan="5"
className="px-5 py-14"
>

<EmptyState

title="No users found"

description="Try another status filter or search term."

/>

</td>

</tr>

}

{

!usersLoading &&

users.map(user=>(

<UserRow

key={user.id}

user={user}

selected={selectedUser?.id===user.id}

actionLoading={actionLoading}

onSelect={()=>onSelect(user)}

onAction={onAction}

/>

))

}

</tbody>

</table>

</div>

);

}