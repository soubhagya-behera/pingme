import { getSocketClient, isSocketConnected } from "./socket";

function safeSubscribe(destination, handler) {
    const client = getSocketClient();
    // H3 FIX: guard against subscribing before STOMP is fully activated or after disconnect
    if (!client || !isSocketConnected() || typeof client.subscribe !== "function") {
        console.warn(`[WS] subscribe attempted before socket ready: ${destination} — returning no-op`);
        return { unsubscribe: () => {} };
    }
    try {
        return client.subscribe(destination, handler);
    } catch (e) {
        console.error(`[WS] subscribe failed for ${destination}`, e);
        return { unsubscribe: () => {} };
    }
}

export function subscribeMessages(callback) {

    return safeSubscribe(
        "/user/queue/messages",

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribePresence(callback) {

    return safeSubscribe(

        "/topic/status",

        status => {

            callback(

                JSON.parse(status.body)

            );

        }

    );

}

export function subscribeMessageStatus(callback) {

    return safeSubscribe(
        "/user/queue/receipts",

        status => {

            callback(

                JSON.parse(status.body)

            );

        }

    );

}

export function subscribeDashboard(callback) {

    const userId =
        localStorage.getItem("userId");

    return safeSubscribe(

        `/topic/dashboard/${userId}`,

        dashboard => {

            callback(

                JSON.parse(dashboard.body)

            );

        }

    );

}

export function subscribeFriendRequests(callback) {

    const userId = localStorage.getItem("userId");

    return safeSubscribe(

        `/topic/friend-request/${userId}`,

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribeFriends(callback){

    const userId = localStorage.getItem("userId");

    return safeSubscribe(

        `/topic/friends/${userId}`,

        message=>{

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribeTyping(callback) {

    return safeSubscribe(

        "/user/queue/typing",

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribeMessageEdited(callback) {

    return safeSubscribe(

        "/user/queue/message-edited",

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribeMessageDeleted(callback) {

    return safeSubscribe(

        "/user/queue/message-deleted",

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribeNotifications(callback) {

    const userId = localStorage.getItem("userId");

    return safeSubscribe(

        `/topic/notifications/${userId}`,

        notification => {

            callback(

                JSON.parse(notification.body)

            );

        }

    );

}

export function subscribeCalls(callback) {

    return safeSubscribe(

        "/user/queue/call",

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}
