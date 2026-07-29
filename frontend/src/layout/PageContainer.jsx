export default function PageContainer({

    children

}){

    return(

        <main
            className="min-h-0 flex-1 overflow-y-auto bg-[var(--background)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8"
        >

            {children}

        </main>

    );

}
