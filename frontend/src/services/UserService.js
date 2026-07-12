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

    }

};

export default UserService;