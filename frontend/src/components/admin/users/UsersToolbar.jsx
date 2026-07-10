import { Filter, Search } from "lucide-react";
import Input from "../../ui/Input";

export default function UsersToolbar({

    search,

    setSearch,

    status,

    setStatus,

    setPage,

    userCount,

    statuses

}){

    return(

<div className="border-b border-[var(--border)] p-5">

<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

<div>

<h2 className="text-xl font-semibold">

User Management

</h2>

<p className="mt-1 text-sm text-[var(--text-secondary)]">

{userCount} user{userCount===1?"":"s"} match the current view.

</p>

</div>

<div className="flex flex-col gap-3 sm:flex-row">

<Input

icon={<Search size={18}/>}

placeholder="Search users"

value={search}

onChange={(e)=>setSearch(e.target.value)}

/>

<div
className="
flex items-center gap-2
rounded-2xl
border border-[var(--border)]
bg-[var(--card)]
px-4 py-3
"
>

<Filter
size={18}
className="text-[var(--text-secondary)]"
/>

<select

className="
bg-transparent
text-[var(--text)]
outline-none
border-0
"

value={status}

onChange={(e)=>{

setStatus(e.target.value);

setPage(0);

}}

>

{

statuses.map(item=>(

<option

key={item}

value={item}

>

{item}

</option>

))

}

</select>

</div>

</div>

</div>

</div>

);

}