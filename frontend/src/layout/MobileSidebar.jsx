import { X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileSidebar({

    open,

    onClose

}){

    if(!open){

        return null;

    }

    return(

        <div className="fixed inset-0 z-50 lg:hidden">

            <button
                className="absolute inset-0 bg-slate-950/50"
                onClick={onClose}
                aria-label="Close menu overlay"
                type="button"
            />

            <div className="relative h-full w-80 max-w-[86vw] bg-[var(--card)] shadow-2xl">

                <button
                    className="absolute right-4 top-4 z-10 rounded-xl border border-[var(--border)] p-2"
                    onClick={onClose}
                    aria-label="Close menu"
                    type="button"
                >
                    <X size={20}/>
                </button>

                <div className="mobile-sidebar-shell h-full">

                    <Sidebar/>

                </div>

            </div>

        </div>

    );

}
