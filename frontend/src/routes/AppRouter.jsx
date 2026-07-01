import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Chat from "../pages/chat/Chat";
import Friends from "../pages/friends/Friends";
import Settings from "../pages/settings/Settings";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AppLayout from "../layout/AppLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        
        <Route
          path="/chat"
          element={
            <AppLayout>
              <Chat />
            </AppLayout>
          }
        />
        
        <Route
          path="/friends"
          element={
            <AppLayout>
              <Friends />
            </AppLayout>
          }
        />
        
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
        
        <Route
          path="/admin"
          element={
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}