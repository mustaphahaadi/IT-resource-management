"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "../services/api"

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

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      // Verify token and get user info
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.get("/auth/user/")
      setUser(response.data)
      setPermissions(response.data.permissions || [])
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
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } finally {
      setUser(null)
      setPermissions([])
      localStorage.removeItem("authToken")
    }
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.role === "admin") return true
    return permissions.includes(permission)
  }

  const hasRole = (role) => {
    if (!user) return false
    return user.role === role
  }

  const hasAnyRole = (roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.put("/auth/profile/", profileData)
      setUser(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await apiService.post("/auth/change-password/", passwordData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Password change failed",
      }
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    updateProfile,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
