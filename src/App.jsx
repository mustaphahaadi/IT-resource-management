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
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/Auth/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/server-error" element={<ServerError />} />
            
            {/* Analytics - public demo */}
            <Route path="/analytics" element={<Analytics />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>
            
            <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><Layout><Requests /></Layout></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout><AdminPanel /></Layout></ProtectedRoute>} />
            
            {/* Root redirect to homepage */}
            <Route path="/" element={<HomePage />} />
            
            {/* Catch all - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
  </BrowserRouter>
    </AuthProvider>
  )
}

export default App
