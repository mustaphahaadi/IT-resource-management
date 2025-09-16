"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { apiService } from "../services/api"
import UserForm from "../components/Auth/UserForm"
import RolePermissions from "../components/Auth/RolePermissions"
import { UserGroupIcon, PlusIcon, PencilIcon, TrashIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

const UserManagement = () => {
  const { hasPermission } = useAuth()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleManager, setShowRoleManager] = useState(false)
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  })

  useEffect(() => {
    if (hasPermission("manage_users")) {
      fetchUsers()
      fetchRoles()
    }
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.get("/auth/users/", { params: filters })
      setUsers(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await apiService.get("/auth/roles/")
      setRoles(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  const handleUserSubmit = async (userData) => {
    try {
      if (selectedUser) {
        await apiService.put(`/auth/users/${selectedUser.id}/`, userData)
      } else {
        await apiService.post("/auth/users/", userData)
      }
      fetchUsers()
      setShowUserForm(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiService.delete(`/auth/users/${userId}/`)
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiService.patch(`/auth/users/${userId}/`, {
        is_active: !currentStatus,
      })
      fetchUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      it_manager: "bg-blue-100 text-blue-800",
      technician: "bg-green-100 text-green-800",
      help_desk: "bg-yellow-100 text-yellow-800",
      viewer: "bg-gray-100 text-gray-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  if (!hasPermission("manage_users")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage users.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their access permissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRoleManager(true)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Manage Roles
          </button>
          <button
            onClick={() => setShowUserForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <select
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            System Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Add your first user to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Department</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role_display_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.department || "N/A"}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserForm(true)
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showUserForm && (
        <UserForm
          user={selectedUser}
          roles={roles}
          onSubmit={handleUserSubmit}
          onClose={() => {
            setShowUserForm(false)
            setSelectedUser(null)
          }}
        />
      )}

      {showRoleManager && (
        <RolePermissions roles={roles} onClose={() => setShowRoleManager(false)} onUpdate={fetchRoles} />
      )}
    </div>
  )
}

export default UserManagement
