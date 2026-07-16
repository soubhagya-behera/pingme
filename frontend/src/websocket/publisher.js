import { getSocketClient } from "./socket";

export function sendChatMessage(message) {

    getSocketClient()?.publish({

        destination: "/app/chat.send",

        body: JSON.stringify(message)

    });

}

function publish(destination, body = {}) {
    getSocketClient()?.publish({ destination, body: JSON.stringify(body) });
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
