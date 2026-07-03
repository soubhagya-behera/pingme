import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export function connectSocket(onMessage) {

    const token = localStorage.getItem("token");

const socket = new SockJS(

    `http://localhost:8080/ws?token=${token}`

);

    stompClient = new Client({

        webSocketFactory: () => socket,

        reconnectDelay: 5000,

        onConnect: () => {

            console.log("Connected");

            const userId = localStorage.getItem("userId");

            stompClient.subscribe(

                `/topic/messages/${userId}`,

                (message) => {

                    onMessage(JSON.parse(message.body));

                }

            );

        }

    });

    stompClient.activate();

}

export function sendSocketMessage(message) {

    if (!stompClient) return;

    stompClient.publish({

        destination: "/app/chat.send",

        body: JSON.stringify(message)

    });

}

export function disconnectSocket() {

    stompClient?.deactivate();

}