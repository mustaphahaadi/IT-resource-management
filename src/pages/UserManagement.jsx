import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { usePermissions, getRoleDisplayName, getRoleColor } from "../contexts/PermissionsContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { apiService } from "../services/api"
import UserForm from "../components/Auth/UserForm"
import RolePermissions from "../components/Auth/RolePermissions"
import { UserGroupIcon, PlusIcon, PencilIcon, TrashIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

const UserManagement = () => {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
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
    approval: "", // "approved" | "pending" | ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (hasPermission("users.view_all")) {
      setError("")
      setSuccess("")
      fetchUsers()
      fetchRoles()
    }
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.role) params.role = filters.role
      if (filters.status === 'active') params.is_active = true
      if (filters.status === 'inactive') params.is_active = false
      if (filters.approval === 'approved') params.is_approved = true
      if (filters.approval === 'pending') params.is_approved = false
      const response = await apiService.getUsers(params)
      setUsers(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await apiService.get("/auth/roles/")
      const list = response.data?.roles || response.data || []
      setRoles(list)
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  const handleUserSubmit = async (userData) => {
    try {
      if (selectedUser) {
        await apiService.updateUser(selectedUser.id, userData)
      } else {
        // Create via registration endpoint, now including role
        const createData = {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          confirm_password: userData.confirm_password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          department: userData.department,
          employee_id: userData.employee_id,
          role: userData.role, // Pass role directly
        }
        await apiService.register(createData)
      }
      fetchUsers()
      setShowUserForm(false)
      setSelectedUser(null)
      setSuccess("User saved successfully")
    } catch (error) {
      console.error("Error saving user:", error)
      setError(error?.response?.data?.error || "Failed to save user")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiService.deleteUser(userId)
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus) {
        await apiService.deactivateUser(userId)
      } else {
        await apiService.activateUser(userId)
      }
      fetchUsers()
      setSuccess("User status updated")
    } catch (error) {
      console.error("Error updating user status:", error)
      setError("Failed to update user status")
    }
  }

  const handleApprove = async (userId) => {
    try {
      await apiService.approveUser(userId)
      fetchUsers()
      setSuccess("User approved")
    } catch (error) {
      console.error("Error approving user:", error)
      setError("Failed to approve user")
    }
  }

  const handleDisapprove = async (userId) => {
    try {
      await apiService.disapproveUser(userId)
      fetchUsers()
      setSuccess("User approval revoked")
    } catch (error) {
      console.error("Error disapproving user:", error)
      setError("Failed to revoke approval")
    }
  }

  const getBadgeColor = (role) => {
    const color = getRoleColor(role)
    return `bg-${color}-100 text-${color}-800`
  }

  if (!hasPermission("users.view_all")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage users. Contact your system administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Support User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions for the IT helpdesk system</p>
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
          {error && (
            <div className="mb-3">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {success && (
            <div className="mb-3">
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </div>
          )}
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
                  <option key={role.name || role.id || role.display_name} value={role.name}>
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
            <div>
              <select
                value={filters.approval}
                onChange={(e) => setFilters((prev) => ({ ...prev, approval: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Approvals</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
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
                    <th className="text-left py-3 px-4 font-medium">Approval</th>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.department || "N/A"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.is_approved ? 'Approved' : 'Pending'}
                          </span>
                          {user.is_approved ? (
                            <button
                              onClick={() => handleDisapprove(user.id)}
                              className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
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
