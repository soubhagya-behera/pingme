import { useEffect, useState } from "react";

import FriendService from "../../services/FriendService";

export default function ChatSidebar({

    selectedFriend,

    onSelect

}){

    const [friends,setFriends]=useState([]);

    useEffect(()=>{

        loadFriends();

    },[]);

    async function loadFriends(){

        try{

            const response=

            await FriendService.getFriends();

            setFriends(response.data.data);

        }

        catch(err){

            console.log(err);

        }

    }

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

                        <div>

                            <h3

                            className="font-semibold"

                            >

                                {friend.fullName}

                            </h3>

                            <p

                            className="text-sm text-slate-500"

                            >

                                {

                                    friend.online

                                    ?"Online"

                                    :"Offline"

                                }

                            </p>

                        </div>

                    </div>

                ))

            }

        </div>

    );

}