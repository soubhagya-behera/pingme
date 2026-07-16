import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

let connected = false;

let waitingCallbacks = [];

export function connectSocket() {

    if (connected) return;

    if (stompClient?.active) return;

    const token = localStorage.getItem("token");


    stompClient = new Client({

    webSocketFactory: () =>

    new SockJS(

        `http://localhost:8080/ws?token=${token}`

    ),

    reconnectDelay: 5000,

    debug: () => {},

    onConnect: () => {

        connected = true;

        waitingCallbacks.forEach(cb => cb());

        waitingCallbacks = [];
    },

    onDisconnect: () => {

        connected = false;
    },

    onWebSocketClose: (event) => {

    },

    onWebSocketError: (event) => {

    },

    onStompError: frame => {

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