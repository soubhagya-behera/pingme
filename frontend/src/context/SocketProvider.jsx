import { createContext, useContext, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../websocket/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {

    const { token } = useAuth();

    useEffect(() => {

        if (!token) return;

        connectSocket();

        return () => {

            disconnectSocket();

        };

    }, [token]);

    return (

        <SocketContext.Provider value={{}}>

            {children}

        </SocketContext.Provider>

    );

}

export function useSocket() {

    return useContext(SocketContext);

}