import { getSocketClient } from "./socket";

export function subscribeMessages(callback) {

    const userId =
        localStorage.getItem("userId");

    return getSocketClient().subscribe(

        `/topic/messages/${userId}`,

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

    const userId =
        localStorage.getItem("userId");

    return getSocketClient().subscribe(

        `/topic/status/${userId}`,

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