import { Link, useLocation } from "react-router-dom"
import {
  HomeIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline"

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation()

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Inventory", href: "/inventory", icon: ComputerDesktopIcon },
    { name: "Requests", href: "/requests", icon: ExclamationTriangleIcon },
    { name: "Tasks", href: "/tasks", icon: ClipboardDocumentListIcon },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ]

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ComputerDesktopIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            {isOpen && <span className="ml-3 text-lg font-semibold text-sidebar-foreground">Hospital IT</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
