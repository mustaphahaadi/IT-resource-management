import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { usePermissions } from "../../contexts/PermissionsContext"

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  requiredAnyRole,
  fallbackPath = "/unauthorized",
}) => {
  const { user, loading } = useAuth()
  const { userRole, hasPermission, hasRoleOrHigher } = usePermissions()

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

  // Check role-based access (exact or hierarchy if prefixed with 'min:')
  if (requiredRole) {
    if (requiredRole.startsWith('min:')) {
      const minRole = requiredRole.replace('min:', '')
      if (!hasRoleOrHigher(minRole)) {
        return <Navigate to={fallbackPath} replace />
      }
    } else if (userRole !== requiredRole) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check if user has any of the required roles
  // For simplicity, if requiredAnyRole is provided, allow if user's role matches any
  if (requiredAnyRole && Array.isArray(requiredAnyRole)) {
    const allowed = requiredAnyRole.includes(userRole)
    if (!allowed) return <Navigate to={fallbackPath} replace />
  }

  return children
}

export default ProtectedRoute
