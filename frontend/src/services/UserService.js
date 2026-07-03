import api from "../api/axios";

const UserService = {

    searchUser(email) {
        return api.get(`/user/search?email=${email}`);
    },

    sendFriendRequest(receiverId) {
        return api.post("/friend-request/send", {
            receiverId: receiverId
        });
    }

};

export default UserService;