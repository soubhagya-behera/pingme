import { createContext, useContext, useEffect } from "react";

import {
    connectSocket,
    disconnectSocket,
    whenSocketConnected
} from "../websocket/socket";

import {
    subscribeMessages,
    subscribePresence,
    subscribeMessageStatus
} from "../websocket/subscriptions";

import ChatService from "../services/ChatService";

import { useAuth } from "./AuthContext";
const SocketContext = createContext(null);

export function SocketProvider({ children }) {

    const { token } = useAuth();

    useEffect(() => {

    if (!token) return;

    connectSocket();

    let messageSubscription;
    let presenceSubscription;
    let statusSubscription;

    whenSocketConnected(() => {

        presenceSubscription = subscribePresence((status) => {

        });

        statusSubscription = subscribeMessageStatus((status) => {

        });

    });

    return () => {

        messageSubscription?.unsubscribe();

        presenceSubscription?.unsubscribe();

        statusSubscription?.unsubscribe();

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