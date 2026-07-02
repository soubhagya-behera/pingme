import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Chat from "../pages/chat/Chat";
import Friends from "../pages/friends/Friends";
import Settings from "../pages/settings/Settings";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AppLayout from "../layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>

<AppLayout>

<Dashboard/>

</AppLayout>

</ProtectedRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <ProtectedRoute>

<AppLayout>

<Chat/>

</AppLayout>

</ProtectedRoute>
          }
        />
        
        <Route
          path="/friends"
          element={
            <ProtectedRoute>

    <AppLayout>

        <Friends/>

    </AppLayout>

</ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>

    <AppLayout>

        <Settings/>

    </AppLayout>

</ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>

    <AppLayout>

        <AdminDashboard/>

    </AppLayout>

</ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}