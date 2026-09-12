import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

let connected = false;

let waitingCallbacks = [];
let connectionListeners = new Set();

function isUsableToken(token) {
    return typeof token === "string" &&
        token.trim() !== "" &&
        token !== "null" &&
        token !== "undefined";
}

export function connectSocket(token) {

    if (connected) return;

    if (stompClient?.active) return;

    if (!isUsableToken(token)) return;

    const socketUrl = `${import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"}?token=${encodeURIComponent(token)}`;

    // Query-token (?token=) is kept only for SockJS/XHR compatibility: the SockJS HTTP
    // handshake cannot send STOMP CONNECT headers. The same JWT is also sent as an
    // Authorization header on STOMP CONNECT (see connectHeaders below) and validated
    // per frame by the backend channel interceptor.


    let client;

    client = new Client({

    webSocketFactory: () =>

    new SockJS(

        socketUrl

    ),

    reconnectDelay: 5000,

    connectHeaders: {
        Authorization: `Bearer ${token}`
    },

    debug: () => {},

    onConnect: () => {

        if (stompClient !== client) return;

        connected = true;

        waitingCallbacks.forEach(cb => cb());

        waitingCallbacks = [];
        connectionListeners.forEach(cb => cb());
    },

    onDisconnect: () => {

        if (stompClient !== client) return;

        connected = false;
    },

    onWebSocketClose: () => {
        if (stompClient !== client) return;
        connected = false;
    },

    onWebSocketError: (event) => {

    },

    onStompError: frame => {

    }

});

    stompClient = client;

    client.activate();

}

export function disconnectSocket() {

    connected = false;

    const client = stompClient;

    stompClient = null;

    client?.deactivate();

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

// Unlike whenSocketConnected, this is called after every successful reconnect.
export function onSocketConnected(callback) {
    connectionListeners.add(callback);
    if (connected) callback();
    return () => connectionListeners.delete(callback);
}
