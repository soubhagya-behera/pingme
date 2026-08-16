import api from "../api/axios";

const ProfileService = {

    getProfile() {
        return api.get("/user/profile");
    },

    updateProfile(data) {
        return api.put("/user/profile", data);
    },

    uploadProfilePhoto(file) {
        const formData = new FormData();
        formData.append("photo", file);
        return api.post("/user/profile/photo", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000
        });
    },

    removeProfilePhoto() {
        return api.delete("/user/profile/photo");
    }

};

export default ProfileService;