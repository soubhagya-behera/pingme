import { createContext, useContext, useEffect, useState } from "react";
import {

    disconnectSocket

}
from "../websocket/socket";

const AuthContext = createContext();

function isUsableToken(value) {

    return typeof value === "string" &&
        value.trim() !== "" &&
        value !== "null" &&
        value !== "undefined";

}

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;

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

    const login = (

    userData,

    jwtToken

)=>{

    // Persist synchronously so HTTP requests issued immediately after login
    // already have credentials. Socket authentication receives jwtToken directly.
    if (!isUsableToken(jwtToken)) {
        throw new Error("Login response did not contain a valid token.");
    }

    localStorage.setItem("token", jwtToken);

    setUser(userData);

    setToken(jwtToken);

    localStorage.setItem(

        "userId",

        userData.id

    );

};

    const logout = ()=>{

        disconnectSocket();

    setUser(null);

    setToken(null);

    localStorage.removeItem("userId");

};

    return (

        <AuthContext.Provider

            value={{

                user,

                token,

                login,

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
