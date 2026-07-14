import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

let connected = false;

let waitingCallbacks = [];

export function connectSocket() {

    if (connected) return;

    if (stompClient?.active) return;

    const token = localStorage.getItem("token");

    const socket = new SockJS(

        `http://localhost:8080/ws?token=${token}`

    );

    stompClient = new Client({

        webSocketFactory: () => socket,

        reconnectDelay: 5000,

        debug: () => {},

        onConnect: () => {

            console.log("✅ WebSocket Connected");

            connected = true;

            waitingCallbacks.forEach(callback => callback());

            waitingCallbacks = [];

        },

        onDisconnect: () => {

            console.log("❌ WebSocket Disconnected");

            connected = false;

        },

        onStompError: frame => {

            console.error(frame);

        }

    });

    stompClient.activate();

}

export function disconnectSocket() {

    connected = false;

    stompClient?.deactivate();

}

export function getSocketClient() {

    return stompClient;

}

export function whenSocketConnected(callback){

    if(

        connected

    ){

        callback();

        return;

    }

    waitingCallbacks.push(callback);

}