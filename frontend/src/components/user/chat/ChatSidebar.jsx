

export default function ChatSidebar({

    selectedFriend,

    onSelect,

    friends,

    setFriends

}){

    

    

    return(

        <div className="rounded-3xl bg-white border border-slate-200 h-full overflow-y-auto">

            <div className="p-5 border-b">

                <h2 className="text-2xl font-bold">

                    Chats

                </h2>

            </div>

            {

                friends.map(friend=>(

                    <div

                        key={friend.id}

                        onClick={()=>onSelect(friend)}

                        className={`

                        flex items-center gap-3

                        p-4 cursor-pointer transition

                        hover:bg-slate-100

                        ${selectedFriend?.id===friend.id

                        ?"bg-indigo-50"

                        :""}

                        `}

                    >

                        <div

                        className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"

                        >

                            {

                                friend.fullName

                                .charAt(0)

                            }

                        </div>

                        <div className="flex-1 min-w-0">

    <div className="flex justify-between items-center">

        <h3 className="font-semibold truncate">

            {friend.fullName}

        </h3>

        <span className="text-xs text-slate-400">

            {

                friend.lastMessageTime

                    ?

                    new Date(friend.lastMessageTime)

                        .toLocaleTimeString([], {

                            hour: "2-digit",

                            minute: "2-digit"

                        })

                    :

                    ""

            }

        </span>

    </div>

    <div className="flex items-center justify-between mt-1">

        <p className="text-sm text-slate-500 truncate">

            {friend.lastMessage || "Start conversation"}

        </p>

        {

            friend.online &&

            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>

        }

    </div>

</div>

                    </div>

                ))

            }

        </div>

    );

}