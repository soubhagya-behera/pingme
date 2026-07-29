import { useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PageContainer from "./PageContainer";
import MobileSidebar from "./MobileSidebar";

export default function AppLayout({

    children

}){

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return(

        <div className="flex min-h-[100dvh] bg-[var(--background)] text-[var(--text)]">

            <Sidebar/>

            <div className="flex min-w-0 flex-1 flex-col">

                <Navbar onMenuClick={() => setMobileSidebarOpen(true)}/>

                <PageContainer>

                    {children}

                </PageContainer>

            </div>

            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

        </div>

    );

}
