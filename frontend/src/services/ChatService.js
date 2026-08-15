import api from "../api/axios";

const ChatService = {

    getHistory(friendId, page = 0, size = 20) {

    return api.get(

        `/messages/history/${friendId}`,

        {

            params: {

                page,

                size

            }

        }

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

    return api.delete(

        `/chat/messages/${messageId}`

    );

},

deleteForMe(messageId){
    return api.delete(
        `/chat/messages/${messageId}/me`

    );

},

forwardMessage(messageId, receiverId) {
    return api.post(
        `/chat/messages/${messageId}/forward`,
        {
            receiverId
        }
    );
},

uploadFile(file, onProgress) {
    const formData = new FormData();

    formData.append("file", file);

    return api.post(

        "/upload/file",

        formData,

        { timeout: 30000, onUploadProgress: event => {
            if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
        }}

    );

},

};

export default ChatService;
