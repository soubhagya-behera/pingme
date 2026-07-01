import { Bell,

    Search,

    UserCircle2

} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";

export default function Navbar(){

    return(

        <header
            className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8"
        >

            <div
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 w-96"
            >

                <Search size={18}/>

                <input

                    placeholder="Search..."

                    className="w-full outline-none"

                />

            </div>

            <div className="flex items-center gap-5">

    <ThemeToggle/>

    <Bell size={22}/>

    <UserCircle2 size={35}/>

</div>

        </header>

    );

}