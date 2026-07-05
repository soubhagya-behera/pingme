export default function PageContainer({

    children

}){

    return(

        <main
            className="flex-1 overflow-y-auto bg-[var(--background)] p-4 sm:p-8"
        >

            {children}

        </main>

    );

}
