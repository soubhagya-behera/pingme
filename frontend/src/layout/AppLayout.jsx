import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PageContainer from "./PageContainer";

export default function AppLayout({

    children

}){

    return(

        <div className="flex h-screen">

            <Sidebar/>

            <div className="flex flex-1 flex-col">

                <Navbar/>

                <PageContainer>

                    {children}

                </PageContainer>

            </div>

        </div>

    );

}