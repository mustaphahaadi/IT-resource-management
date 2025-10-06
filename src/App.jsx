import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import Dashboard from "./pages/Dashboard"
import Inventory from "./pages/Inventory"
import Requests from "./pages/Requests"
import Tasks from "./pages/Tasks"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import Register from "./pages/Register"
import ResetPassword from "./pages/ResetPassword"
import VerifyEmail from "./pages/VerifyEmail"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"
import ServerError from "./pages/ServerError"
import AdminPanel from "./pages/AdminPanel"
import HomePage from "./pages/HomePage"
import SearchResults from "./pages/SearchResults"
import Help from "./pages/Help"
import SystemStatus from "./pages/SystemStatus"
import Profile from "./pages/Profile"
import BackupExport from "./pages/BackupExport"
import Notifications from "./pages/Notifications"
import ApiDocs from "./pages/ApiDocs"
import ActivityLog from "./pages/ActivityLog"
import UserManagement from "./pages/UserManagement"
import AdminSettings from "./pages/AdminSettings"
import Assignment from "./pages/Assignment"
import TeamManagement from "./pages/TeamManagement"
import KnowledgeBase from "./pages/KnowledgeBase"
import KnowledgeBaseAdmin from "./pages/KnowledgeBaseAdmin"
import SelfService from "./pages/SelfService"
import { AuthProvider } from "./contexts/AuthContext"
import { PermissionsProvider } from "./contexts/PermissionsContext"
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import RoleBasedRoute from "./components/Auth/RoleBasedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PermissionsProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-background">
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/server-error" element={<ServerError />} />
            
            {/* Public pages */}
            
            {/* Protected routes with nested layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inventory/*" element={<Inventory />} />
              <Route path="requests/*" element={<Requests />} />
              <Route
                path="tasks/*"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                    <Tasks />
                  </RoleBasedRoute>
                }
              />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="team"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician"]}>
                    <TeamManagement />
                  </RoleBasedRoute>
                }
              />
              <Route path="help" element={<Help />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="self-service" element={<SelfService />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="knowledge-base/:articleId" element={<KnowledgeBaseArticle />} />

              {/* Admin Routes */}
              <Route path="admin" element={<RoleBasedRoute requiredRoles={["system_admin"]}><Outlet /></RoleBasedRoute>} >
                <Route index element={<AdminPanel />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="backup" element={<BackupExport />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="activity-log" element={<ActivityLog />} />
                <Route path="health" element={<SystemStatus />} />
                <Route path="api-docs" element={<ApiDocs />} />
                <Route path="knowledge-base" element={<KnowledgeBaseAdmin />} />
              </Route>

              <Route
                path="assignment"
                element={
                  <RoleBasedRoute requiredRoles={["staff", "system_admin"]}>
                    <Assignment />
                  </RoleBasedRoute>
                }
              />
            </Route>
            
            
            {/* Catch all - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
        </PermissionsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
