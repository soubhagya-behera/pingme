export default function EmptyState({

    icon: Icon,

    title,

    description

}){

    return(

        <div className="mx-auto flex max-w-md flex-col items-center text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-slate-800">

                <Icon size={24}/>

            </div>

            <h3 className="mt-4 text-lg font-semibold">

                {title}

            </h3>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">

                {description}

            </p>

        </div>

    );

}