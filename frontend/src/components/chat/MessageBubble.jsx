export default function MessageBubble({

    mine,

    text

}){

    return(

        <div

            className={`flex ${mine ? "justify-end" : "justify-start"}`}

        >

            <div

                className={`max-w-sm rounded-2xl px-4 py-3

                ${mine

                ? "bg-indigo-600 text-white"

                : "bg-slate-200"

                }`}

            >

                {text}

            </div>

        </div>

    );

}