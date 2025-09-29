import React, { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'

const PermissionsContext = createContext()

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  end_user: 1,
  technician: 2,
  senior_technician: 3,
  it_manager: 4,
  system_admin: 5
}

// Permission definitions based on IT helpdesk roles
const PERMISSIONS = {
  // Equipment permissions
  'equipment.view_all': ['system_admin', 'it_manager'],
  'equipment.view_department': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'equipment.view_basic': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'equipment.create': ['system_admin', 'it_manager', 'senior_technician'],
  'equipment.update': ['system_admin', 'it_manager', 'senior_technician'],
  'equipment.delete': ['system_admin', 'it_manager'],
  'equipment.manage': ['system_admin', 'it_manager', 'senior_technician'],
  
  // Request permissions
  'requests.view_all': ['system_admin', 'it_manager'],
  'requests.view_department': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'requests.view_own': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'requests.create': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'requests.update': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'requests.assign': ['system_admin', 'it_manager', 'senior_technician'],
  'requests.escalate': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'requests.close': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'requests.delete': ['system_admin', 'it_manager'],
  
  // Task permissions
  'tasks.view_all': ['system_admin', 'it_manager'],
  'tasks.view_department': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'tasks.view_assigned': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'tasks.create': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'tasks.update': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'tasks.assign': ['system_admin', 'it_manager', 'senior_technician'],
  'tasks.delete': ['system_admin', 'it_manager'],
  
  // Knowledge base permissions
  'knowledge.view': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'knowledge.create': ['system_admin', 'it_manager', 'senior_technician'],
  'knowledge.update': ['system_admin', 'it_manager', 'senior_technician'],
  'knowledge.delete': ['system_admin', 'it_manager'],
  
  // User management permissions
  'users.view_all': ['system_admin'],
  'users.create': ['system_admin'],
  'users.update': ['system_admin'],
  'users.delete': ['system_admin'],
  'users.approve': ['system_admin', 'it_manager'],
  
  // Reporting permissions
  'reports.basic': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'reports.advanced': ['system_admin', 'it_manager'],
  'reports.analytics': ['system_admin', 'it_manager'],
  'reports.export': ['system_admin', 'it_manager'],
  
  // System administration
  'system.settings': ['system_admin'],
  'system.config': ['system_admin'],
  'system.backup': ['system_admin'],
  'system.monitoring': ['system_admin', 'it_manager'],
  
  // Navigation permissions
  'nav.dashboard': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'nav.requests': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'nav.equipment': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'nav.tasks': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'nav.knowledge': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'nav.reports': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'nav.admin': ['system_admin'],
  'nav.users': ['system_admin'],
  
  // UI Features
  'ui.create_request': ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'],
  'ui.assign_tickets': ['system_admin', 'it_manager', 'senior_technician'],
  'ui.escalate_tickets': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'ui.close_tickets': ['system_admin', 'it_manager', 'senior_technician', 'technician'],
  'ui.manage_equipment': ['system_admin', 'it_manager', 'senior_technician'],
  'ui.view_all_data': ['system_admin', 'it_manager'],
  'ui.bulk_operations': ['system_admin', 'it_manager'],
  'ui.system_settings': ['system_admin'],
}

export function PermissionsProvider({ children }) {
  const { user } = useAuth()

  const permissions = useMemo(() => {
    if (!user) return {}

    const userRole = user.role || 'end_user'
    const userDepartment = user.department || ''
    const isApproved = user.is_approved || user.role === 'system_admin'

    return {
      // Check if user has a specific permission
      hasPermission: (permission) => {
        if (!isApproved && userRole !== 'system_admin') return false
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
        if (!isApproved && userRole !== 'system_admin') return false
        
        switch (scope) {
          case 'all':
            return ['system_admin', 'it_manager'].includes(userRole)
          case 'department':
            return ['system_admin', 'it_manager', 'senior_technician', 'technician'].includes(userRole)
          case 'own':
            return true
          default:
            return false
        }
      },

      // Check if user can edit data scope
      canEditScope: (scope) => {
        if (!isApproved && userRole !== 'system_admin') return false
        
        switch (scope) {
          case 'all':
            return ['system_admin', 'it_manager'].includes(userRole)
          case 'department':
            return ['system_admin', 'it_manager', 'senior_technician'].includes(userRole)
          case 'own':
            return ['system_admin', 'it_manager', 'senior_technician', 'technician', 'end_user'].includes(userRole)
          default:
            return false
        }
      },

      // Department-based checks
      canAccessDepartment: (targetDepartment) => {
        if (!isApproved && userRole !== 'system_admin') return false
        if (['system_admin', 'it_manager'].includes(userRole)) return true
        if (['senior_technician', 'technician'].includes(userRole)) {
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
      isSystemAdmin: userRole === 'system_admin',
      isITManager: userRole === 'it_manager',
      isSeniorTechnician: userRole === 'senior_technician',
      isTechnician: userRole === 'technician',
      isEndUser: userRole === 'end_user',
      isStaff: ['system_admin', 'it_manager'].includes(userRole),
      isTechnicalStaff: ['system_admin', 'it_manager', 'senior_technician', 'technician'].includes(userRole),
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

// Helper function to get user role display name
export function getRoleDisplayName(role) {
  const roleNames = {
    'end_user': 'End User',
    'technician': 'Technician',
    'senior_technician': 'Senior Technician',
    'it_manager': 'IT Manager',
    'system_admin': 'System Administrator'
  }
  return roleNames[role] || 'Unknown Role'
}

// Helper function to get role color for UI
export function getRoleColor(role) {
  const roleColors = {
    'end_user': 'gray',
    'technician': 'blue',
    'senior_technician': 'indigo',
    'it_manager': 'purple',
    'system_admin': 'red'
  }
  return roleColors[role] || 'gray'
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
