import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;

    });

    const [token, setToken] = useState(

        localStorage.getItem("token")

    );

    // Save Token
    useEffect(() => {

        if (token) {

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

    setUser(userData);

    setToken(jwtToken);

    localStorage.setItem(

        "userId",

        userData.id

    );

};

    const logout = ()=>{

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