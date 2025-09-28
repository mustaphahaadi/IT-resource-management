import React, { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'

const PermissionsContext = createContext()

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  user: 1,
  technician: 2,
  manager: 3,
  staff: 4,
  admin: 5
}

// Permission definitions
const PERMISSIONS = {
  // Equipment permissions
  'equipment.view_all': ['admin', 'staff'],
  'equipment.view_department': ['admin', 'staff', 'technician', 'manager'],
  'equipment.view_own': ['admin', 'staff', 'technician', 'manager', 'user'],
  'equipment.create': ['admin', 'staff', 'technician'],
  'equipment.update': ['admin', 'staff', 'technician'],
  'equipment.delete': ['admin', 'staff'],
  
  // Request permissions
  'requests.view_all': ['admin', 'staff'],
  'requests.view_department': ['admin', 'staff', 'technician', 'manager'],
  'requests.view_own': ['admin', 'staff', 'technician', 'manager', 'user'],
  'requests.create': ['admin', 'staff', 'technician', 'manager', 'user'],
  'requests.update': ['admin', 'staff', 'technician'],
  'requests.assign': ['admin', 'staff', 'technician'],
  'requests.delete': ['admin', 'staff'],
  
  // Task permissions
  'tasks.view_all': ['admin', 'staff'],
  'tasks.view_department': ['admin', 'staff', 'technician', 'manager'],
  'tasks.view_assigned': ['admin', 'staff', 'technician', 'manager', 'user'],
  'tasks.create': ['admin', 'staff', 'technician'],
  'tasks.update': ['admin', 'staff', 'technician'],
  'tasks.assign': ['admin', 'staff', 'technician'],
  'tasks.delete': ['admin', 'staff'],
  
  // Personnel permissions
  'personnel.view_all': ['admin', 'staff'],
  'personnel.view_department': ['admin', 'staff', 'technician', 'manager'],
  'personnel.create': ['admin', 'staff'],
  'personnel.update': ['admin', 'staff'],
  'personnel.delete': ['admin', 'staff'],
  
  // Admin permissions
  'admin.users': ['admin'],
  'admin.settings': ['admin'],
  'admin.reports': ['admin', 'staff'],
  'admin.analytics': ['admin', 'staff', 'manager'],
  
  // Navigation permissions
  'nav.dashboard': ['admin', 'staff', 'technician', 'manager', 'user'],
  'nav.equipment': ['admin', 'staff', 'technician', 'manager', 'user'],
  'nav.requests': ['admin', 'staff', 'technician', 'manager', 'user'],
  'nav.tasks': ['admin', 'staff', 'technician', 'manager', 'user'],
  'nav.analytics': ['admin', 'staff', 'manager'],
  'nav.reports': ['admin', 'staff', 'manager'],
  'nav.admin': ['admin'],
  
  // UI Features
  'ui.create_equipment': ['admin', 'staff', 'technician'],
  'ui.edit_equipment': ['admin', 'staff', 'technician'],
  'ui.delete_equipment': ['admin', 'staff'],
  'ui.assign_requests': ['admin', 'staff', 'technician'],
  'ui.assign_tasks': ['admin', 'staff', 'technician'],
  'ui.view_all_data': ['admin', 'staff'],
  'ui.manage_users': ['admin'],
  'ui.system_settings': ['admin'],
  'ui.advanced_reports': ['admin', 'staff'],
}

export function PermissionsProvider({ children }) {
  const { user } = useAuth()

  const permissions = useMemo(() => {
    if (!user) return {}

    const userRole = user.role || 'user'
    const userDepartment = user.department || ''
    const isApproved = user.is_approved || user.role === 'admin'

    return {
      // Check if user has a specific permission
      hasPermission: (permission) => {
        if (!isApproved && userRole !== 'admin') return false
        const allowedRoles = PERMISSIONS[permission] || []
        return allowedRoles.includes(userRole)
      },

      // Check if user has any of the permissions
      hasAnyPermission: (permissionList) => {
        return permissionList.some(permission => 
          permissions.hasPermission(permission)
        )
      },

      // Check if user has all permissions
      hasAllPermissions: (permissionList) => {
        return permissionList.every(permission => 
          permissions.hasPermission(permission)
        )
      },

      // Check role hierarchy
      hasRoleOrHigher: (requiredRole) => {
        const userLevel = ROLE_HIERARCHY[userRole] || 0
        const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
        return userLevel >= requiredLevel
      },

      // Check if user can view data scope
      canViewScope: (scope) => {
        if (!isApproved && userRole !== 'admin') return false
        
        switch (scope) {
          case 'all':
            return ['admin', 'staff'].includes(userRole)
          case 'department':
            return ['admin', 'staff', 'technician', 'manager'].includes(userRole)
          case 'own':
            return true
          default:
            return false
        }
      },

      // Check if user can edit data scope
      canEditScope: (scope) => {
        if (!isApproved && userRole !== 'admin') return false
        
        switch (scope) {
          case 'all':
            return ['admin', 'staff'].includes(userRole)
          case 'department':
            return ['admin', 'staff', 'technician'].includes(userRole)
          case 'own':
            return ['admin', 'staff', 'technician', 'manager', 'user'].includes(userRole)
          default:
            return false
        }
      },

      // Department-based checks
      canAccessDepartment: (targetDepartment) => {
        if (!isApproved && userRole !== 'admin') return false
        if (['admin', 'staff'].includes(userRole)) return true
        if (userRole === 'technician') {
          return targetDepartment?.toLowerCase() === userDepartment?.toLowerCase() || 
                 targetDepartment?.toLowerCase() === 'it'
        }
        return targetDepartment?.toLowerCase() === userDepartment?.toLowerCase()
      },

      // User info
      user,
      userRole,
      userDepartment,
      isApproved,
      isAdmin: userRole === 'admin',
      isStaff: ['admin', 'staff'].includes(userRole),
      isTechnician: userRole === 'technician',
      isManager: userRole === 'manager',
      isUser: userRole === 'user',
    }
  }, [user])

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

// Higher-order component for permission-based rendering
export function withPermissions(Component, requiredPermissions = []) {
  return function PermissionWrappedComponent(props) {
    const { hasAnyPermission } = usePermissions()
    
    if (requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions)) {
      return <Component {...props} />
    }
    
    return null
  }
}

// Component for conditional rendering based on permissions
export function PermissionGate({ 
  permissions = [], 
  requireAll = false, 
  fallback = null, 
  children 
}) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()
  
  if (permissions.length === 0) return children
  
  let hasAccess = false
  
  if (typeof permissions === 'string') {
    hasAccess = hasPermission(permissions)
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissions)
  } else {
    hasAccess = hasAnyPermission(permissions)
  }
  
  return hasAccess ? children : fallback
}

// Component for role-based rendering
export function RoleGate({ 
  roles = [], 
  minRole = null, 
  fallback = null, 
  children 
}) {
  const { userRole, hasRoleOrHigher } = usePermissions()
  
  let hasAccess = false
  
  if (minRole) {
    hasAccess = hasRoleOrHigher(minRole)
  } else if (roles.length > 0) {
    hasAccess = roles.includes(userRole)
  }
  
  return hasAccess ? children : fallback
}

export default PermissionsContext
