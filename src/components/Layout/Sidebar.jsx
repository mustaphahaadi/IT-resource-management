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
  UserCircleIcon
} from "@heroicons/react/24/outline"

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Inventory", href: "/inventory", icon: ComputerDesktopIcon },
    { name: "Requests", href: "/requests", icon: ExclamationTriangleIcon },
    { name: "Tasks", href: "/tasks", icon: ClipboardDocumentListIcon },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  ]

  const adminNavigation = [
    { name: "Admin Panel", href: "/admin", icon: UsersIcon },
  ]

  const userNavigation = [
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
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
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            {isOpen && <span className="ml-3 text-lg font-semibold text-gray-900">Hospital IT</span>}
          </Link>
        </div>

        {/* User Info */}
        {isOpen && user && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
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
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                        ? "bg-red-100 text-red-700 border-r-2 border-red-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                    ? "bg-green-100 text-green-700 border-r-2 border-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
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
