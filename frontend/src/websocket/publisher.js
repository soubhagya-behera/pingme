import { getSocketClient, isSocketConnected } from "./socket";

function safePublish(destination, body = {}) {
    // B-W3: publishing while disconnected must never throw. The optional-
    // chain below does NOT protect against stompjs throwing TypeError when
    // the client exists but has no underlying STOMP connection.
    if (!isSocketConnected()) return false;
    try {
        getSocketClient()?.publish({ destination, body: JSON.stringify(body) });
        return true;
    } catch (e) {
        console.error(`[WS] publish failed for ${destination}`, e);
        return false;
    }
}

export function sendChatMessage(message) {

    safePublish("/app/chat.send", message);

}

function publish(destination, body = {}) {
    // B-W3: never throws; callers intentionally ignore the return value.
    safePublish(destination, body);
}

export function acknowledgeDelivery(messageId) {
    publish("/app/chat.delivered", { messageId });
}

export function acknowledgeRead(messageId) {
    publish("/app/chat.read", { messageId });
}

export function announceSocketReady() {
    publish("/app/chat.ready");
}

export function sendTyping(receiverId) {

    publish(

        "/app/chat.typing",

        {

            receiverId,

            typing: true

        }

    );

}

export function sendStopTyping(receiverId) {

    publish(

        "/app/chat.typing",

        {

            receiverId,

            typing: false

        }

    );

}

export function sendActiveConversation(friendId) {

    publish(

        "/app/chat.active",

        {

            friendId

        }

    );

}

export function publishCallSignal(signal) {

    publish("/app/call.signal", signal);

}
