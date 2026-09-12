import axios from "axios";

const api = axios.create({

    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"

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

api.interceptors.response.use(
    (response) => response,

    (error) => {

        const status = error.response?.status;

        const url = error.config?.url || "";

        const isAuthEndpoint = url.includes("/auth/");

        // 401 means the token is missing, expired, or invalid.
        // Clear the dead session and return to login instead of
        // leaving pages stuck in their loading state.
        if (status === 401 && !isAuthEndpoint) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            localStorage.removeItem("userId");

            window.location.replace("/login");

        }

        return Promise.reject(error);

    }
);

export function getApiOrigin() {
    const base = api.defaults.baseURL || "http://localhost:8080/api";
    return base.replace(/\/api\/?$/, "");
}

export default api;
