import {
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import Button from "../../ui/Button";

export default function Pagination({

    usersPage,

    setPage

}){

return(

<div className="flex flex-col gap-3 border-t border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">

<p className="text-sm text-[var(--text-secondary)]">

Page {(usersPage?.page||0)+1}

of

{Math.max(usersPage?.totalPages||1,1)}

</p>

<div className="flex gap-2">

<Button

variant="secondary"

className="flex items-center gap-2 px-4 py-2"

disabled={usersPage?.first}

onClick={()=>setPage(p=>Math.max(p-1,0))}

>

<ChevronLeft size={16}/>

Previous

</Button>

<Button

variant="secondary"

className="flex items-center gap-2 px-4 py-2"

disabled={usersPage?.last}

onClick={()=>!usersPage?.last&&setPage(p=>p+1)}

>

Next

<ChevronRight size={16}/>

</Button>

</div>

</div>

);

}