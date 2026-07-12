import { getSocketClient } from "./socket";

export function sendChatMessage(message) {

    getSocketClient()?.publish({

        destination: "/app/chat.send",

        body: JSON.stringify(message)

    });

}