import api from "../api/axios";

const ChatService={

    getHistory(friendId){

        return api.get(

            `/messages/history/${friendId}`

        );

    },

    sendMessage(data){

        return api.post(

            "/chat/send",

            data

        );

    }

};

export default ChatService;