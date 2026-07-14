import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketProvider";

import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(

    <AuthProvider>

        <SocketProvider>

            <ThemeProvider>

                <Toaster position="top-right" />

                <App />

            </ThemeProvider>

        </SocketProvider>

    </AuthProvider>

);