import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions, PermissionGate, getRoleDisplayName, getRoleColor } from "../../contexts/PermissionsContext"
import {
  HomeIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  CloudArrowDownIcon,
  ServerIcon,
  
  BellIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  UserIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline"

const Sidebar = ({ isOpen }) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { hasPermission, userRole, isApproved } = usePermissions()

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/app/dashboard", 
      icon: HomeIcon,
      permission: "nav.dashboard",
      description: "Overview and quick actions"
    },
    { 
      name: "Support Tickets", 
      href: "/app/requests", 
      icon: ExclamationTriangleIcon,
      permission: "nav.requests",
      description: "IT support requests and tickets"
    },
    { 
      name: "Asset Inventory", 
      href: "/app/inventory", 
      icon: ComputerDesktopIcon,
      permission: "equipment.view_basic",
      description: "IT assets and equipment tracking"
    },
    { 
      name: "Tasks", 
      href: "/app/tasks", 
      icon: ClipboardDocumentListIcon,
      permission: "nav.tasks",
      description: "Technical tasks and assignments"
    },
    { 
      name: "Knowledge Base", 
      href: "/app/knowledge-base", 
      icon: BookOpenIcon,
      permission: "nav.knowledge",
      description: "Documentation and solutions"
    },
    { 
      name: "Reports", 
      href: "/app/reports", 
      icon: ChartBarIcon,
      permission: "nav.reports",
      description: "Performance and analytics"
    },
  ]

  const managementNavigation = [
    { 
      name: "Team Management", 
      href: "/app/team", 
      icon: UserGroupIcon,
      permission: "ui.assign_tickets",
      description: "Manage technicians and assignments"
    },
    { 
      name: "Ticket Assignment", 
      href: "/app/assignment", 
      icon: WrenchScrewdriverIcon,
      permission: "ui.assign_tickets",
      description: "Assign and manage tickets"
    },
    { 
      name: "Asset Management", 
      href: "/app/asset-management", 
      icon: ClipboardDocumentCheckIcon,
      permission: "equipment.manage",
      description: "Advanced asset tracking and audits"
    },
  ]

  const adminNavigation = [
    { 
      name: "User Management", 
      href: "/app/users", 
      icon: UsersIcon,
      permission: "nav.users",
      description: "Manage system users"
    },
    { 
      name: "System Settings", 
      href: "/app/admin/settings", 
      icon: Cog6ToothIcon,
      permission: "system.settings",
      description: "System configuration"
    },
    { 
      name: "Security & Audit", 
      href: "/app/admin/security", 
      icon: ShieldCheckIcon,
      permission: "system.monitoring",
      description: "Security logs and monitoring"
    },
    { 
      name: "System Health", 
      href: "/app/admin/health", 
      icon: ServerIcon,
      permission: "system.monitoring",
      description: "System status and performance"
    },
    { 
      name: "Backup & Export", 
      href: "/app/admin/backup", 
      icon: CloudArrowDownIcon,
      permission: "system.backup",
      description: "Data backup and export"
    },
  ]

  const userNavigation = [
    { 
      name: "Self-Service Portal", 
      href: "/app/self-service", 
      icon: UserIcon,
      description: "Access knowledge base and create tickets"
    },
    { 
      name: "Notifications", 
      href: "/app/notifications", 
      icon: BellIcon,
      description: "System notifications and alerts"
    },
    { 
      name: "My Profile", 
      href: "/app/profile", 
      icon: UserCircleIcon,
      description: "Personal settings and info"
    },
    { 
      name: "Help & Training", 
      href: "/app/help", 
      icon: AcademicCapIcon,
      description: "User guides and training"
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div
      className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-blue-50">
          <Link to="/app/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
            </div>
            {isOpen && <span className="ml-3 text-lg font-semibold text-blue-900">IT Support</span>}
          </Link>
        </div>

        {/* User Info */}
        {isOpen && user && (
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center">
              <UserCircleIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${getRoleColor(userRole)}-100 text-${getRoleColor(userRole)}-800`}>
                    {getRoleDisplayName(userRole)}
                  </span>
                  {!isApproved && userRole !== 'system_admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Approval
                    </span>
                  )}
                </div>
                {user.department && (
                  <p className="text-xs text-gray-500 capitalize">{user.department}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {/* Main Navigation */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
            
            if (item.permission && !hasPermission(item.permission)) {
              return null
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border-r-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            )
          })}

          {/* Management Navigation */}
          <PermissionGate permissions={"ui.assign_tickets"}>
            {isOpen && <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</div>}
            {managementNavigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
              
              if (item.permission && !hasPermission(item.permission)) {
                return null
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-purple-100 text-purple-700 border-r-4 border-purple-600"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              )
            })}
          </PermissionGate>

          {/* Admin Navigation */}
          <PermissionGate permissions={"system.settings"}>
            {isOpen && <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</div>}
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
              
              if (item.permission && !hasPermission(item.permission)) {
                return null
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-red-100 text-red-700 border-r-4 border-red-600"
                      : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              )
            })}
          </PermissionGate>

          {/* User Navigation */}
          {isOpen && <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal</div>}
          {userNavigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 border-r-4 border-green-600"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-200"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
