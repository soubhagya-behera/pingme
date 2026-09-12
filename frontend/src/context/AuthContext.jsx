import { createContext, useContext, useEffect, useState } from "react";
import {
    disconnectSocket

}
from "../websocket/socket";
import * as offlineDB from "../offline/db";
import AuthService from "../services/AuthService";
import { clearMediaCache } from "../hooks/useSecureMedia";

const AuthContext = createContext();

function isUsableToken(value) {

    return typeof value === "string" &&
        value.trim() !== "" &&
        value !== "null" &&
        value !== "undefined";

}

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        // C8: never let malformed localStorage crash the app. Only the "user" entry
        // is discarded here; IndexedDB offline data stays untouched and isolated.
        try {
            const savedUser = localStorage.getItem("user");

            if (!savedUser) return null;

            const parsed = JSON.parse(savedUser);

            if (
                parsed == null ||
                typeof parsed !== "object" ||
                Array.isArray(parsed) ||
                (parsed.id != null && Number.isNaN(Number(parsed.id))) ||
                (parsed.email != null && typeof parsed.email !== "string")
            ) {
                localStorage.removeItem("user");
                return null;
            }

            return parsed;
        } catch {
            localStorage.removeItem("user");
            return null;
        }

    });

    const [token, setToken] = useState(() => {

        const savedToken = localStorage.getItem("token");

        return isUsableToken(savedToken) ? savedToken : null;

    });

    // Save Token
    useEffect(() => {

        if (isUsableToken(token)) {

            localStorage.setItem("token", token);

        } else {

            localStorage.removeItem("token");

        }

    }, [token]);

    // Save User
    useEffect(() => {

        if (user) {

            localStorage.setItem(

                "user",

                JSON.stringify(user)

            );

        } else {

            localStorage.removeItem("user");

        }

    }, [user]);

    // On mount, purge any pre-fix orphaned offline data that was stored without owner scoping
    useEffect(() => {
        offlineDB.purgeOrphanedData?.().catch(()=>{});
    }, []);

    const login = (

    userData,

    jwtToken

)=>{

    // Persist synchronously so HTTP requests issued immediately after login
    // already have credentials. Socket authentication receives jwtToken directly.
    if (!isUsableToken(jwtToken)) {
        throw new Error("Login response did not contain a valid token.");
    }

    const newUserId = String(userData.id);
    const prevUserId = localStorage.getItem("userId");
    // If switching accounts, disconnect any previous socket immediately
    if (prevUserId && prevUserId !== newUserId) {
        try { disconnectSocket(); } catch {}
        clearMediaCache();
    }

    // Atomically persist new identity before React state updates
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userId", newUserId);

    setUser(userData);

    setToken(jwtToken);

    // Purge orphaned pre-fix IndexedDB data that could leak across accounts (async, best-effort)
    offlineDB.purgeOrphanedData?.().catch(()=>{});

};

    const updateUser = (updates) => {

        setUser(prev => (prev ? { ...prev, ...updates } : prev));

    };

    const logout = ()=>{

        // Best-effort server-side revocation (bumps token version) before clearing
        // local state. Fire-and-forget: local logout must not block on the network.
        try { AuthService.logout(); } catch {}

        // Drop cached media blob URLs bound to this account so no avatar/file can
        // linger for a subsequent account in the same browser.
        clearMediaCache();

        disconnectSocket();

    // Synchronously clear ALL auth-related storage so no stale identity survives
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    setUser(null);

    setToken(null);

};

    return (

        <AuthContext.Provider

            value={{

                user,

                token,

                login,

                updateUser,

                logout

            }}

        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(AuthContext);

}
