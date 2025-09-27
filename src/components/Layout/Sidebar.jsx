import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  HomeIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  HeartIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  CloudArrowDownIcon,
  ServerIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  BellIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline"

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/app/dashboard", icon: HomeIcon },
    { name: "Inventory", href: "/app/inventory", icon: ComputerDesktopIcon },
    { name: "Requests", href: "/app/requests", icon: ExclamationTriangleIcon },
    { name: "Tasks", href: "/app/tasks", icon: ClipboardDocumentListIcon },
    { name: "Reports", href: "/app/reports", icon: ChartBarIcon },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  ]

  const adminNavigation = [
    { name: "Admin Panel", href: "/app/admin", icon: UsersIcon },
    { name: "Activity Log", href: "/app/activity-log", icon: ClipboardDocumentCheckIcon },
    { name: "Backup & Export", href: "/app/backup", icon: CloudArrowDownIcon },
    { name: "System Status", href: "/app/status", icon: ServerIcon },
    { name: "API Docs", href: "/app/api-docs", icon: DocumentTextIcon },
  ]

  const userNavigation = [
    { name: "Notifications", href: "/app/notifications", icon: BellIcon },
    { name: "Profile", href: "/app/profile", icon: UserCircleIcon },
    { name: "Settings", href: "/app/settings", icon: Cog6ToothIcon },
    { name: "Help", href: "/app/help", icon: QuestionMarkCircleIcon },
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
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            {isOpen && <span className="ml-3 text-lg font-semibold text-blue-900">Hospital IT</span>}
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
                <p className="text-xs text-blue-600 capitalize font-medium">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {/* Main Navigation */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
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

          {/* Admin Navigation */}
          {user && (user.role === 'admin' || user.is_superuser) && (
            <>
              {isOpen && <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</div>}
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href
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
            </>
          )}

          {/* User Navigation */}
          {isOpen && <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</div>}
          {userNavigation.map((item) => {
            const isActive = location.pathname === item.href
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
