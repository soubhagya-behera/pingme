import { Phone, Video, MoreVertical } from "lucide-react";
import { ArrowLeft } from "lucide-react";
export default function ChatHeader({

friend,

onBack,
typing

}) {

    return (

        <div className="h-20 border-b px-6 flex items-center justify-between bg-white">

            <div className="flex items-center gap-4">

    {/* Mobile Back Button */}

    <button

        onClick={onBack}

        className="md:hidden p-2 rounded-full hover:bg-slate-100"

    >

        <ArrowLeft size={22} />

    </button>

    <div className="relative">

        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">

            {friend.fullName.charAt(0)}

        </div>

        {

            friend.online &&

            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>

        }

    </div>

    <div>

        <h2 className="font-semibold text-lg">

            {friend.fullName}

        </h2>

        <p
    className={`text-sm ${
        typing
            ? "text-indigo-600 font-medium"
            : friend.online
                ? "text-green-600"
                : "text-slate-500"
    }`}
>
    {
        typing
            ? "Typing..."
            : friend.online
                ? "Online"
                : "Last seen recently"
    }
</p>

    </div>

</div>

            <div className="flex items-center gap-3">

                <button className="p-2 rounded-full hover:bg-slate-100">

                    <Phone size={18} />

                </button>

                <button className="p-2 rounded-full hover:bg-slate-100">

                    <Video size={18} />

                </button>

                <button className="p-2 rounded-full hover:bg-slate-100">

                    <MoreVertical size={18} />

                </button>

            </div>

        </div>

    );

}