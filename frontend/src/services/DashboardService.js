import api from "../api/axios";

const DashboardService = {

    getFriends() {
        return api.get("/friend-request/friends");
    },

    getIncomingRequests() {
        return api.get("/friend-request/incoming");
    },

    getRecentChats() {
        return api.get("/message/recent");
    }

};

export default DashboardService;