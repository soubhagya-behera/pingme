export default function PageContainer({

    children,

    fullBleed = false

}){

    return(

        <main

            className={
                fullBleed
                    ?
                    "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                    :
                    "min-h-0 min-w-0 flex-1 overflow-y-auto bg-[var(--background)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8"
            }

        >

            {children}

        </main>

    );

}
