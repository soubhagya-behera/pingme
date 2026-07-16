import { getSocketClient } from "./socket";

export function subscribeMessages(callback) {

    return getSocketClient().subscribe(
        "/user/queue/messages",

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribePresence(callback) {

    return getSocketClient().subscribe(

        "/topic/status",

        status => {

            callback(

                JSON.parse(status.body)

            );

        }

    );

}

export function subscribeMessageStatus(callback) {

    return getSocketClient().subscribe(
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

    return getSocketClient().subscribe(

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

    return getSocketClient().subscribe(

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

    return getSocketClient().subscribe(

        `/topic/friends/${userId}`,

        message=>{

            callback(

                JSON.parse(message.body)

            );

        }

    );

}

export function subscribeTyping(callback) {

    return getSocketClient().subscribe(

        "/user/queue/typing",

        message => {

            callback(

                JSON.parse(message.body)

            );

        }

    );

}
