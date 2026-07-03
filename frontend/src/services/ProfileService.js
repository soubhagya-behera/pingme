import api from "../api/axios";

const ProfileService = {

    getProfile() {
        return api.get("/user/profile");
    },

    updateProfile(data) {
        return api.put("/user/profile", data);
    }

};

export default ProfileService;