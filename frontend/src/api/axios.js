import axios from "axios";

const api = axios.create({

    baseURL:"http://localhost:8080/api",

    headers:{

        "Content-Type":"application/json"

    }

});

api.interceptors.request.use((config) => {

    if (
        config.url.includes("/auth/login") ||
        config.url.includes("/auth/register")
    ) {
        return config;
    }

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;