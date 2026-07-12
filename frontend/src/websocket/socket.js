import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export function connectSocket(onConnected) {

    if (
        stompClient &&
        stompClient.connected
    ) {
        return;
    }

    const token =
        localStorage.getItem("token");

    const socket = new SockJS(

        `http://localhost:8080/ws?token=${token}`

    );

    stompClient = new Client({

        webSocketFactory: () => socket,

        reconnectDelay: 5000,

        debug: () => {},

        onConnect: () => {

            console.log("WebSocket Connected");

            onConnected?.();

        },

        onStompError: frame => {

            console.error(frame);

        }

    });

    stompClient.activate();

}

export function disconnectSocket() {

    stompClient?.deactivate();

}

export function getSocketClient() {

    return stompClient;

}