const statusStyles = {

    PENDING:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",

    APPROVED:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",

    REJECTED:
        "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",

    SUSPENDED:
        "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100"

};

export default function StatusBadge({ status }) {

    return (

        <span
            className={`
                inline-flex
                shrink-0
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${statusStyles[status]}
            `}
        >

            {status || "UNKNOWN"}

        </span>

    );

}