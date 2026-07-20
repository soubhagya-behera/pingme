import {
    ChevronDown,
    Reply,
    Pencil,
    Trash2,
    Copy,
    Forward
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MessageActionsMenu({

    mine,

    onReply,

    onEdit,

    onDelete,

    message

}) {

    const [open,setOpen]=useState(false);

    const menuRef=useRef(null);

    useEffect(()=>{

        function outside(event){

            if(

                menuRef.current &&

                !menuRef.current.contains(event.target)

            ){

                setOpen(false);

            }

        }

        document.addEventListener(

            "mousedown",

            outside

        );

        return()=>{

            document.removeEventListener(

                "mousedown",

                outside

            );

        };

    },[]);

    return(

        <div

            ref={menuRef}

            className="relative"

        >

            <button

                onClick={()=>setOpen(previous=>!previous)}

                className="

                    opacity-0

                    group-hover:opacity-100

                    transition

                    p-1

                    rounded-full

                    hover:bg-slate-200

                "

            >

                <ChevronDown size={18}/>

            </button>

            {

                open &&

                (

                    <div
    className={`
        absolute
        bottom-full
        mb-2
        ${mine ? "right-0" : "left-0"}
        w-52
        rounded-xl
        bg-white
        border
        shadow-2xl
        py-2
        z-[999]
    `}
>

                        <button

                            onClick={()=>{

                                onReply(message);

                                setOpen(false);

                            }}

                            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"

                        >

                            <Reply size={18}/>

                            Reply

                        </button>

                        {

                            mine &&

                            <button

                                onClick={()=>{

                                    onEdit(message);

                                    setOpen(false);

                                }}

                                className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"

                            >

                                <Pencil size={18}/>

                                Edit

                            </button>

                        }

                        <button

                            onClick={()=>{

                                navigator.clipboard.writeText(

                                    message.content

                                );

                                setOpen(false);

                            }}

                            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"

                        >

                            <Copy size={18}/>

                            Copy

                        </button>

                        {

                            mine &&

                            <button

                                onClick={()=>{

                                    onDelete(message);

                                    setOpen(false);

                                }}

                                className="flex w-full items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600"

                            >

                                <Trash2 size={18}/>

                                Delete

                            </button>

                        }

                        <button

                            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"

                        >

                            <Forward size={18}/>

                            Forward

                        </button>

                    </div>

                )

            }

        </div>

    );

}