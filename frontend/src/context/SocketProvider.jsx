import {
    createContext,
    useContext,
    useEffect
} from "react";

import {
    connectSocket,
    disconnectSocket
} from "../websocket/socket";

const SocketContext = createContext();

export function SocketProvider({ children }) {

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (token) {

            connectSocket();

        }

        return () => {

            disconnectSocket();

        };

    }, []);

    return (

        <SocketContext.Provider value={{}}>

            {children}

        </SocketContext.Provider>

    );

}

export function useSocket() {

    return useContext(SocketContext);

}