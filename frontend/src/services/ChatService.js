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

    async markDelivered(messageId) {

    const response = await api.post(
        "/chat/delivered",
        {
            messageId
        }
    );

    return response;
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

getChatSidebar() {
    return api.get("/messages/chat-sidebar");
},

};

export default ChatService;