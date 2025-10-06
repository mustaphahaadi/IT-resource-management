import { BrowserRouter, Routes, Route } from "react-router-dom"
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
import Analytics from "./pages/Analytics"
import AdminPanel from "./pages/AdminPanel"
import HomePage from "./pages/HomePage"
import Features from "./pages/Features"
import About from "./pages/About"
import Pricing from "./pages/Pricing"
import Contact from "./pages/Contact"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"
import Security from "./pages/Security"
import Resources from "./pages/Resources"
import Careers from "./pages/Careers"
import Blog from "./pages/Blog"
import SearchResults from "./pages/SearchResults"
import Help from "./pages/Help"
import SystemStatus from "./pages/SystemStatus"
import Profile from "./pages/Profile"
import BackupExport from "./pages/BackupExport"
import Maintenance from "./pages/Maintenance"
import Notifications from "./pages/Notifications"
import ApiDocs from "./pages/ApiDocs"
import ActivityLog from "./pages/ActivityLog"
import UserManagement from "./pages/UserManagement"
import AdminSettings from "./pages/AdminSettings"
import Assignment from "./pages/Assignment"
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
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/server-error" element={<ServerError />} />
            
            {/* Public pages */}
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/security" element={<Security />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/help" element={<Help />} />
            <Route path="/status" element={<SystemStatus />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            
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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/new" element={<Inventory />} />
              <Route path="inventory/:equipmentId" element={<Inventory />} />
              <Route path="inventory/:equipmentId/edit" element={<Inventory />} />
              <Route path="requests" element={<Requests />} />
              <Route path="requests/new" element={<Requests />} />
              <Route path="requests/:requestId" element={<Requests />} />
              <Route path="requests/:requestId/edit" element={<Requests />} />
              <Route
                path="tasks"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                    <Tasks />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="tasks/new"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                    <Tasks />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="tasks/:taskId"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                    <Tasks />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="tasks/:taskId/edit"
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
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <UserManagement />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <UserManagement />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="assignment"
                element={
                  <RoleBasedRoute requiredRoles={["staff", "system_admin"]}>
                    <Assignment />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="backup"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <BackupExport />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="admin/backup"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <BackupExport />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="admin/settings"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <AdminSettings />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="admin/security"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <ActivityLog />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="admin/health"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <SystemStatus />
                  </RoleBasedRoute>
                }
              />
              <Route path="help" element={<Help />} />
              <Route path="knowledge" element={<Help />} />
              <Route
                path="status"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <SystemStatus />
                  </RoleBasedRoute>
                }
              />
              <Route path="search" element={<SearchResults />} />
              <Route path="notifications" element={<Notifications />} />
              <Route
                path="api-docs"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <ApiDocs />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="activity-log"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <ActivityLog />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <RoleBasedRoute requiredRoles={["system_admin"]}>
                    <AdminPanel />
                  </RoleBasedRoute>
                }
              />
            </Route>
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
            <Route path="/inventory/new" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
            <Route path="/inventory/:equipmentId" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
            <Route path="/inventory/:equipmentId/edit" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><Layout><Requests /></Layout></ProtectedRoute>} />
            <Route path="/requests/new" element={<ProtectedRoute><Layout><Requests /></Layout></ProtectedRoute>} />
            <Route path="/requests/:requestId" element={<ProtectedRoute><Layout><Requests /></Layout></ProtectedRoute>} />
            <Route path="/requests/:requestId/edit" element={<ProtectedRoute><Layout><Requests /></Layout></ProtectedRoute>} />
            <Route
              path="/tasks"
              element={
                <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                  <Layout>
                    <Tasks />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            <Route
              path="/tasks/new"
              element={
                <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                  <Layout>
                    <Tasks />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            <Route
              path="/tasks/:taskId"
              element={
                <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                  <Layout>
                    <Tasks />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            <Route
              path="/tasks/:taskId/edit"
              element={
                <RoleBasedRoute requiredRoles={["system_admin", "it_manager", "senior_technician", "technician"]}>
                  <Layout>
                    <Tasks />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route
              path="/admin"
              element={
                <RoleBasedRoute requiredRoles={["system_admin"]}>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </RoleBasedRoute>
              }
            />
            
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
