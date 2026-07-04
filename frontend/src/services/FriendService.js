import api from "../api/axios";

const FriendService = {

    getFriends() {
        return api.get("/friend-request/friends");
    },

    getRecentChats() {

        return api.get("/messages/recent");

    },

    getIncomingRequests() {
        return api.get("/friend-request/incoming");
    },

    acceptRequest(id) {
        return api.post(`/friend-request/accept/${id}`);
    },

    rejectRequest(id) {
        return api.post(`/friend-request/reject/${id}`);
    }

};

export default FriendService;