import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export function connectSocket(

    onMessage,

    onUserStatus,

    onMessageStatus

) {

    const token = localStorage.getItem("token");

    const socket = new SockJS(

        `http://localhost:8080/ws?token=${token}`

    );

    stompClient = new Client({

        webSocketFactory: () => socket,

        reconnectDelay: 5000,

        onConnect: () => {

            console.log("Connected");

            const userId =
                localStorage.getItem("userId");

            // Private Messages

            stompClient.subscribe(

                `/topic/messages/${userId}`,

                (message) => {

                    console.log(

                        "Socket Message:",

                        message.body

                    );

                    onMessage(

                        JSON.parse(message.body)

                    );

                }

            );

            // Online / Offline

            stompClient.subscribe(

                "/topic/status",

                (status) => {

                    console.log(

                        "User Status:",

                        status.body

                    );

                    onUserStatus(

                        JSON.parse(status.body)

                    );

                }

            );

            // Delivered / Read

            stompClient.subscribe(

                `/topic/status/${userId}`,

                (status) => {

                    console.log(

                        "Message Status:",

                        status.body

                    );

                    onMessageStatus(

                        JSON.parse(status.body)

                    );

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