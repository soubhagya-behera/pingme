export default function PageContainer({

    children

}){

    return(

        <main
            className="flex-1 overflow-y-auto bg-slate-100 p-8"
        >

            {children}

        </main>

    );

}