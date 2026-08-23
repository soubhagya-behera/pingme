import { useState } from "react";

import AppRail from "./AppRail";
import PageContainer from "./PageContainer";
import MobileHeader from "./MobileHeader";
import MobileNavDrawer from "./MobileNavDrawer";

export default function AppLayout({

    children,

    fullBleed = false

}){

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return(

        <div className="flex h-[100dvh] w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">

            <AppRail/>

            <div className="flex min-w-0 flex-1 flex-col">

                <MobileHeader onMenuClick={() => setMobileNavOpen(true)}/>

                <PageContainer fullBleed={fullBleed}>

                    {children}

                </PageContainer>

            </div>

            <MobileNavDrawer
                open={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />

        </div>

    );

}
