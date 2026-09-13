import axios from "axios";
import { disconnectSocket } from "../websocket/socket";

// H4: single-flight guard to avoid multiple simultaneous 401 handlers fighting
let handling401 = false;

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

        // 401 means token missing, expired, invalid, or revoked via token-version.
        // H4 SAFER handling: disconnect WS cleanly, avoid ghost sessions, avoid clearing new user's session,
        // preserve IndexedDB offline outbox, avoid redirect loops/fighting.
        if (status === 401 && !isAuthEndpoint) {

            // Avoid redirect loops: already on login or already handling
            if (handling401) {
                return Promise.reject(error);
            }
            // If already on login page, don't redirect again
            if (typeof window !== "undefined" && window.location.pathname === "/login") {
                return Promise.reject(error);
            }
            // Do not clear a newly established session due to stale request from previous account:
            // compare the token that caused 401 with current stored token.
            try {
                const currentToken = localStorage.getItem("token");
                // If no current session, nothing to clear (already logged out)
                if (!currentToken) {
                    return Promise.reject(error);
                }
                const reqAuth = error.config?.headers?.Authorization || error.config?.headers?.authorization || "";
                const requestToken = typeof reqAuth === "string" ? reqAuth.replace(/^Bearer\s+/i, "") : "";
                if (requestToken && requestToken !== currentToken) {
                    // Stale request from previous account — ignore to avoid wiping new session
                    return Promise.reject(error);
                }
            } catch {
                // If token comparison fails, proceed to safe handling
            }

            handling401 = true;

            // 1. Disconnect WebSocket cleanly to avoid ghost online presence
            try { disconnectSocket(); } catch {}

            // 2. Clear authentication state safely — NEVER touch IndexedDB outbox
            try {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("userId");
            } catch {}

            // 3. Redirect to login (single flight)
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                window.location.replace("/login");
            }

        }

        return Promise.reject(error);

    }
);

export function getApiOrigin() {
    const base = api.defaults.baseURL || "http://localhost:8080/api";
    return base.replace(/\/api\/?$/, "");
}

export default api;
