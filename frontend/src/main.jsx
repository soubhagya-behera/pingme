import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketProvider";

import { ChatRealtimeProvider } from "./context/ChatRealtimeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CallProvider } from "./context/CallContext";

import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(

    <AuthProvider>

    <SocketProvider>

        <CallProvider>

        <ChatRealtimeProvider>

            <NotificationProvider>

            <ThemeProvider>

                <Toaster
    position="top-right"
    reverseOrder={false}
    gutter={10}
    toastOptions={{
        duration: 3000,
        style: {
            background: "#1e293b",
            color: "#fff",
            borderRadius: "14px",
            padding: "14px 18px",
            fontSize: "14px"
        },
        success: {
            iconTheme: {
                primary: "#22c55e",
                secondary: "#ffffff"
            }
        },
        error: {
            iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff"
            }
        }
    }}
/>

                <App/>

            </ThemeProvider>

            </NotificationProvider>

        </ChatRealtimeProvider>

        </CallProvider>

    </SocketProvider>

</AuthProvider>

);