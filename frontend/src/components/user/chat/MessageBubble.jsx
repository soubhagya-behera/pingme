export default function MessageBubble({

    mine,

    text,

    time,

    status

}){

    function getStatus(){

        if(!mine) return null;

        if(status==="SENT"){

            return "✓";

        }

        if(status==="DELIVERED"){

            return "✓✓";

        }

        if(status==="READ"){

            return (

                <span className="text-sky-300">

                    ✓✓

                </span>

            );

        }

        return null;

    }

    return(

        <div

            className={`flex ${mine ? "justify-end" : "justify-start"}`}

        >

            <div

                className={`

                max-w-[70%]

                rounded-3xl

                px-4

                py-2.5

                ${mine

                    ? "bg-indigo-600 text-white"

                    : "bg-slate-200 text-black"

                }

                `}

            >

                <div>

                    {text}

                </div>

                <div

                    className={`

                    mt-2

                    flex

                    justify-end

                    items-center

                    gap-1

                    text-xs

                    ${mine

                        ? "text-indigo-100"

                        : "text-slate-500"

                    }

                    `}

                >

                    {

                        time ?

                        new Date(time).toLocaleTimeString([],{

                            hour:"2-digit",

                            minute:"2-digit"

                        })

                        :

                        ""

                    }

                    {

                        getStatus()

                    }

                </div>

            </div>

        </div>

    );

}