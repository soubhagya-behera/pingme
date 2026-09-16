import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

let connected = false;

let waitingCallbacks = [];
let connectionListeners = new Set();

// B-W1/W5: token epoch bound to the live client. A changed token forces the
// old client to deactivate and a new one to be built, so a stale account
// credential can never remain active after logout / account switch / rotation.
let activeToken = null;

function isUsableToken(token) {
    return typeof token === "string" &&
        token.trim() !== "" &&
        token !== "null" &&
        token !== "undefined";
}

function readStoredToken() {
    try {
        const token = localStorage.getItem("token");
        return isUsableToken(token) ? token : null;
    } catch {
        return null;
    }
}

function buildSocketUrl(token) {
    return `${import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"}?token=${encodeURIComponent(token)}`;
}

// B-W6: an ERROR frame that carries an auth failure must stop useless
// reconnect churn and route through the existing session-expiry handling.
function isAuthFailure(frame) {
    const haystack = `${frame?.headers?.message || ""} ${frame?.body || ""}`.toLowerCase();
    return haystack.includes("auth") ||
        haystack.includes("credential") ||
        haystack.includes("unauthorized") ||
        haystack.includes("forbidden") ||
        haystack.includes("expired");
}

// B-W3: one failing connection listener must never prevent the others.
function notifyConnectionListeners() {
    connectionListeners.forEach(cb => {
        try { cb(); } catch (e) { console.error("[WS] connection listener failed", e); }
    });
}

function stopReconnectChurn(client) {
    try { client.reconnectDelay = 0; } catch {}
    // B-W6: fire-and-forget — deactivate() awaits the socket close, which
    // never resolves for a dead transport; awaiting it here would hang the
    // auth-failure path. deactivate() itself clears the reconnect timer first.
    try { client.deactivate(); } catch {}
}

function buildClient(token) {
    // Query-token (?token=) is kept only for SockJS/XHR compatibility: the SockJS HTTP
    // handshake cannot send STOMP CONNECT headers. The same JWT is also sent as an
    // Authorization header on STOMP CONNECT (see connectHeaders below) and validated
    // per frame by the backend channel interceptor.
    const client = new Client({

    webSocketFactory: () =>

    new SockJS(

        buildSocketUrl(token)

    ),

    reconnectDelay: 5000,

    // B-W2: explicit heartbeats (match the backend 10s/10s broker values) so
    // half-open connections are detected instead of silently going stale.
    heartbeatIncoming: 10000,

    heartbeatOutgoing: 10000,

    connectHeaders: {
        Authorization: `Bearer ${token}`
    },

    // B-W1: refresh credentials on every (re)connect attempt so automatic
    // retries always present the latest stored token, never a stale closure.
    beforeConnect: () => {
        const fresh = readStoredToken();
        if (fresh) {
            client.connectHeaders = { Authorization: `Bearer ${fresh}` };
            if (activeToken !== null && fresh !== activeToken) activeToken = fresh;
        }
    },

    debug: () => {},

    onConnect: () => {

        if (stompClient !== client) return;

        connected = true;

        waitingCallbacks.forEach(cb => {
            try { cb(); } catch (e) { console.error("[WS] queued callback failed", e); }
        });

        waitingCallbacks = [];
        notifyConnectionListeners();
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
        console.error("[WS] websocket error", event?.type || event);
    },

    onStompError: frame => {
        if (stompClient !== client) return;
        connected = false;
        console.error("[WS] STOMP error", frame?.headers?.message || frame);
        if (isAuthFailure(frame)) {
            // B-W6: stop churn with a dead credential and hand over to the
            // existing safe session-expiry path (axios single-flight 401
            // handler). The event carries no token or user data.
            stopReconnectChurn(client);
            try {
                window.dispatchEvent(new CustomEvent("pingme:ws-auth-failed"));
            } catch {}
        }
    }

});

    return client;
}

export function connectSocket(token) {

    // B-W1: prefer the explicit token, fall back to storage (reconnect paths).
    const freshToken = isUsableToken(token) ? token : readStoredToken();

    if (!isUsableToken(freshToken)) return;

    // B-W1/W5: a different token must never reuse the old client — tear it
    // down first so the previous account's session cannot linger.
    if (stompClient && activeToken !== null && freshToken !== activeToken) {
        const old = stompClient;
        stompClient = null;
        connected = false;
        waitingCallbacks = [];
        try { old.deactivate(); } catch {}
    }

    if (connected) return;

    if (stompClient?.active) return;

    const client = buildClient(freshToken);

    activeToken = freshToken;

    stompClient = client;

    client.activate();

}

export function disconnectSocket() {

    connected = false;

    const client = stompClient;

    stompClient = null;
    activeToken = null;

    // H3 FIX: clear one-shot callbacks so stale subscriptions from previous account never fire for next user
    waitingCallbacks = [];
    // B-W5: drop persistent reconnect listeners too — every owner re-registers
    // on (re)mount/login, so no stale-account callback can fire for the next user.
    connectionListeners = new Set();

    client?.deactivate();

}

export function isSocketConnected() {
    return connected && !!stompClient?.active;
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
    if (connected) {
        try { callback(); } catch (e) { console.error("[WS] connection listener failed", e); }
    }
    return () => { connectionListeners.delete(callback); };
}
