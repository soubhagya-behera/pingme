import api from "../api/axios";

const UserService = {

    searchUsers(keyword) {

        return api.get(

            `/user/search?keyword=${encodeURIComponent(keyword)}`

        );

    },

    sendFriendRequest(receiverId) {

        return api.post(

            "/friend-request/send",

            {

                receiverId

            }

        );

    },

    acceptRequest(requestId){

        return api.put(

            `/friend-request/accept/${requestId}`

        );

    },

    rejectRequest(requestId){

        return api.put(

            `/friend-request/reject/${requestId}`

        );

    },

    cancelRequest(requestId){

        return api.delete(

            `/friend-request/cancel/${requestId}`

        );

    },

    changePassword(data) {
    return api.put(
        "/user/change-password",
        data
    );
},

};

export default UserService;