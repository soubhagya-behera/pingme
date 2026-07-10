import { MoreHorizontal } from "lucide-react";

export default function IconButton({

    children,

    danger = false,

    loading = false,

    title,

    onClick

}){

return(

<button

className={`

flex

h-9

w-9

items-center

justify-center

rounded-lg

border

transition

${

danger

?

"border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"

:

"border-[var(--border)] text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800"

}

`}

disabled={loading}

onClick={onClick}

title={title}

type="button"

>

{

loading

?

<MoreHorizontal size={17}/>

:

children

}

</button>

);

}