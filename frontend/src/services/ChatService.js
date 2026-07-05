import api from "../api/axios";

const ChatService = {

    getHistory(friendId) {

        return api.get(

            `/messages/history/${friendId}`

        );

    },

    getRecentChats() {

        return api.get(

            "/messages/recent"

        );

    },

    sendMessage(data) {

        return api.post(

            "/chat/send",

            data

        );

    },

    markDelivered(messageId) {

    return api.post(

        "/chat/delivered",

        {

            messageId

        }

    );

},

markRead(messageId) {

    return api.post(

        "/chat/read",

        {

            messageId

        }

    );

},

markConversationRead(friendId) {

    return api.post(

        `/chat/read/${friendId}`

    );

},

};

export default ChatService;