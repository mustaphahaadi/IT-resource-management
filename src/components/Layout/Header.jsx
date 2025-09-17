import { MagnifyingGlassIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline"
import { useAuth } from "../../contexts/AuthContext"

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          <div className="relative hidden md:block">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory, tickets, or equipment..."
              className="pl-10 pr-4 py-2 w-96 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-700">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || "User"}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
