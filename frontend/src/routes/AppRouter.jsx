import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RegisterSuccess from "../pages/auth/RegisterSuccess";
import Dashboard from "../pages/user/dashboard/Dashboard";
import AdminOverview from "../pages/admin/AdminOverview";
import UsersPage from "../pages/admin/UsersPage";
import QueriesPage from "../pages/admin/QueriesPage";
import AdminSettings from "../pages/admin/SettingsPage";

import AdminLayout from "../layout/AdminLayout";

import { Navigate } from "react-router-dom";
import Chat from "../pages/user/chat/Chat";
import Friends from "../pages/user/friends/Friends";
import Settings from "../pages/user/settings/Settings";
import Profile from "../pages/user/profile/Profile";
import FriendRequests from "../pages/user/requests/FriendRequests";

import AppLayout from "../layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import ActivateAccount from "../pages/auth/ActivateAccount";
import ForgotPassword from "../pages/auth/ForgotPassword";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />}
/>

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Chat />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Friends />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FriendRequests />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
    path="/admin"
    element={
        <ProtectedRoute roles={["ADMIN"]}>
            <AdminLayout />
        </ProtectedRoute>
    }
>

    <Route
        index
        element={<Navigate to="dashboard" replace />}
    />

    <Route
        path="dashboard"
        element={<AdminOverview />}
    />

    <Route
        path="users"
        element={<UsersPage />}
    />

    <Route
        path="queries"
        element={<QueriesPage />}
    />

    <Route
        path="settings"
        element={<AdminSettings />}
    />

</Route>
      </Routes>
    </BrowserRouter>
  );
}