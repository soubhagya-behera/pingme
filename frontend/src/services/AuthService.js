import api from "../api/axios";

const AuthService = {

    login(data) {
        return api.post("/auth/login", data);
    },

    register(data) {
        return api.post("/auth/register", data);
    },

    validateActivationToken(token) {
        return api.get(`/auth/activate?token=${token}`);
    },

    setPassword(data) {
        return api.post("/auth/set-password", data);
    },

    forgotPassword(data) {
    return api.post("/auth/forgot-password", data);
},

resetPassword(data) {
    return api.post("/auth/reset-password", data);
}

};

export default AuthService;