import api from "../api/axios";

const FriendService={

    getFriends(){

        return api.get(

            "/friend-request/friends"

        );

    }

};

export default FriendService;