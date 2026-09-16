import { useEffect, useState } from "react";

import AppRail from "./AppRail";
import PageContainer from "./PageContainer";
import MobileHeader from "./MobileHeader";
import MobileNavDrawer from "./MobileNavDrawer";
import { useAuth } from "../context/AuthContext";
import { syncPendingMessages } from "../offline/syncQueue";
import { onSocketConnected } from "../websocket/socket";

export default function AppLayout({

    children,

    fullBleed = false

}){

    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { token } = useAuth();

    // B-O4: app-level outbox drain — the Chat page owns the message UI, but
    // pending messages must sync no matter which protected page lands first
    // after a hard refresh (auth-gated: no token, no sync).
    useEffect(() => {
        if (!token) return;
        syncPendingMessages().catch(() => {});
        const removeReconnectTrigger = onSocketConnected(() => syncPendingMessages().catch(() => {}));
        const onOnline = () => syncPendingMessages().catch(() => {});
        window.addEventListener("online", onOnline);
        return () => {
            removeReconnectTrigger?.();
            window.removeEventListener("online", onOnline);
        };
    }, [token]);

    return(

        <div className="app-layout flex h-[100dvh] w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">

            <AppRail/>

            <div className="app-main-col flex min-w-0 flex-1 flex-col">

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
