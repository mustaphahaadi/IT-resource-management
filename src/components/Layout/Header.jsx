import { MagnifyingGlassIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline"
import { useAuth } from "../../contexts/AuthContext"

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inventory, tickets, or equipment..."
              className="pl-10 pr-4 py-2 w-96 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-muted-foreground hover:text-foreground">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name || "IT Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.role || "Administrator"}</p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">{user?.name?.charAt(0) || "A"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
