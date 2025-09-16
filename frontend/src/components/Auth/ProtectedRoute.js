"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  requiredAnyRole,
  fallbackPath = "/unauthorized",
}) => {
  const { user, loading, hasRole, hasPermission, hasAnyRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check if user has any of the required roles
  if (requiredAnyRole && !hasAnyRole(requiredAnyRole)) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}

export default ProtectedRoute
