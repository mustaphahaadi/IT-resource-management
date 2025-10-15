import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "../services/api"
import { websocketService } from "../services/websocket"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      // Verify token and get user info
      fetchUserProfile()
    } else {
      setLoading(false)
    }

    // Set up online/offline listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Set up WebSocket connection when user is authenticated
  useEffect(() => {
    const wsEnabled = String(import.meta?.env?.VITE_WS_ENABLED ?? 'false') === 'true'
    if (user && isOnline && wsEnabled) {
      websocketService.connect()
      websocketService.startHeartbeat()

      // Set up WebSocket event listeners and capture unsubscribe functions
      const unsubNotif = websocketService.onNotification((notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
      })

      const unsubConnected = websocketService.on('connected', () => {
        // Real-time connection established
      })

      const unsubDisconnected = websocketService.on('disconnected', () => {
        // Real-time connection lost
      })

      return () => {
        try { unsubNotif && unsubNotif() } catch (e) { console.debug('unsubNotif cleanup error', e) }
        try { unsubConnected && unsubConnected() } catch (e) { console.debug('unsubConnected cleanup error', e) }
        try { unsubDisconnected && unsubDisconnected() } catch (e) { console.debug('unsubDisconnected cleanup error', e) }
        websocketService.stopHeartbeat()
        websocketService.disconnect()
      }
    }
  }, [user, isOnline])

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getCurrentUser()
      setUser(response.data)
      setPermissions(response.data.permissions || [])
      
      // Fetch initial notifications
      try {
        const notificationsResponse = await apiService.getNotifications({ limit: 20 })
        setNotifications(notificationsResponse.data.notifications || notificationsResponse.data.results || notificationsResponse.data || [])
      } catch (notifError) {
        console.warn("Could not fetch notifications:", notifError)
        setNotifications([]) // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      localStorage.removeItem("authToken")
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials)
      setUser(response.data.user)
      setPermissions(response.data.user.permissions || [])
      return { success: true }
    } catch (error) {
      // Extract DRF serializer errors if present
      const data = error.response?.data
      let message = data?.message
      if (!message && data) {
        if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
          message = data.non_field_errors[0]
        } else if (Array.isArray(data.email) && data.email.length) {
          message = data.email[0]
        } else if (Array.isArray(data.password) && data.password.length) {
          message = data.password[0]
        }
      }
      return {
        success: false,
        error: message || "Invalid credentials. Please check your email/username and password.",
      }
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } finally {
      setUser(null)
      setPermissions([])
      setNotifications([])
      localStorage.removeItem("authToken")
      websocketService.disconnect()
    }
  }

  const markNotificationRead = async (notificationId) => {
    try {
      await apiService.markNotificationRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      await apiService.markAllNotificationsRead()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      )
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getUnreadNotificationCount = () => {
    return notifications.filter(notif => !notif.is_read).length
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.role === "admin") return true
    return permissions.includes(permission)
  }

  const hasRole = (role) => {
    if (!user) return false
    if (user.is_superuser) return true
    return user.role === role
  }

  const hasAnyRole = (roles) => {
    if (!user) return false
    if (user.is_superuser) return true
    return roles.includes(user.role)
  }

  const canAccessAdmin = () => {
    if (!user) return false
    if (user.is_superuser) return true
    if (user.role === 'admin') return true
    if (user.role === 'manager') return user.is_approved === true
    return false
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData)
      setUser(response.data)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Profile update failed" }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await apiService.post("/auth/change-password/", passwordData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Password change failed" }
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    permissions,
    notifications,
    isOnline,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessAdmin,
    updateProfile,
    changePassword,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    websocketService, // Expose websocket service for components that need it
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
