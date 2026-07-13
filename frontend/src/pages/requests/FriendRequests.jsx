import { useEffect, useState } from "react";

import {

    connectSocket,

    disconnectSocket

} from "../../websocket/socket";

import {

    subscribeFriendRequests

} from "../../websocket/subscriptions";

import FriendService from "../../services/FriendService";

import Card from "../../components/ui/Card";

import Button from "../../components/ui/Button";

export default function FriendRequests(){

    const [requests,setRequests]=useState([]);

    useEffect(() => {

    loadRequests();

    connectSocket(() => {

        const subscription =

            subscribeFriendRequests(

                async () => {

                    await loadRequests();

                }

            );

        return () => {

            subscription.unsubscribe();

        };

    });

    return () => {

        disconnectSocket();

    };

}, []);

    async function loadRequests(){

        const res=

        await FriendService.getIncomingRequests();

        setRequests(res.data.data);

    }

    async function accept(id){

        await FriendService.acceptRequest(id);

        loadRequests();

    }

    async function reject(id){

        await FriendService.rejectRequest(id);

        loadRequests();

    }

    return(

        <div>

            <h1 className="text-4xl font-bold mb-8">

                Friend Requests

            </h1>

            {

                requests.map(request=>(

                    <Card

                        key={request.requestId}

                        className="flex items-center justify-between mb-4 p-6"

                    >

                        <div>

                            <h2 className="font-bold text-xl">

                                {request.senderName}

                            </h2>

                            <p>

                                wants to connect with you

                            </p>

                        </div>

                        <div className="flex gap-3">

                            <Button

                                onClick={()=>accept(request.requestId)}

                            >

                                Accept

                            </Button>

                            <Button

                                onClick={()=>reject(request.requestId)}

                            >

                                Reject

                            </Button>

                        </div>

                    </Card>

                ))

            }

        </div>

    );

}