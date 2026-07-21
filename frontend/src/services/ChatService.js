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

markConversationRead(friendId) {

    return api.post(

        `/chat/read/${friendId}`

    );

},

getChatSidebar() {
    return api.get("/messages/chat-sidebar");
},

editMessage(messageId, content) {

    return api.put(

        `/chat/messages/${messageId}`,

        {

            content

        }

    );

},

deleteForEveryone(messageId) {

    return axios.delete(

        `/chat/messages/${messageId}`

    );

},

};

export default ChatService;
