import api from "../api/axios";

const FriendService = {

    getFriends() {
    return api.get("/friends");
},

    getRecentChats() {

        return api.get("/messages/recent");

    },

    getIncomingRequests() {
        return api.get("/friend-request/incoming");
    },

    acceptRequest(id) {
    return api.put(`/friend-request/accept/${id}`);
},

rejectRequest(id) {
    return api.put(`/friend-request/reject/${id}`);
}

};

export default FriendService;