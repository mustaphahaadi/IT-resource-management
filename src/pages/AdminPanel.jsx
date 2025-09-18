import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../services/api"
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from "@heroicons/react/24/outline"

const AdminPanel = () => {
  const { user, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loginAttempts, setLoginAttempts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Check if user has admin access
  if (!user || !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to access the admin panel.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "statistics") {
      fetchStatistics()
    } else if (activeTab === "security") {
      fetchLoginAttempts()
    }
  }, [activeTab, currentPage, searchTerm, roleFilter, departmentFilter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        role: roleFilter === "all" ? "" : roleFilter,
        department: departmentFilter === "all" ? "" : departmentFilter,
        is_active: statusFilter === "active" ? "true" : statusFilter === "inactive" ? "false" : "",
      }
      
      const response = await apiService.getUsers(params)
      setUsers(response.data.results)
      setTotalPages(Math.ceil(response.data.count / 20))
    } catch (err) {
      setError("Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await apiService.getAdminStatistics()
      setStatistics(response.data)
    } catch (err) {
      setError("Failed to fetch statistics")
      console.error("Error fetching statistics:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLoginAttempts = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await apiService.getRecentLoginAttempts(100)
      setLoginAttempts(response.data)
    } catch (err) {
      setError("Failed to fetch login attempts")
      console.error("Error fetching login attempts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      let response
      switch (action) {
        case "approve":
          response = await apiService.approveUser(userId)
          break
        case "disapprove":
          response = await apiService.disapproveUser(userId)
          break
        case "activate":
          response = await apiService.activateUser(userId)
          break
        case "deactivate":
          response = await apiService.deactivateUser(userId)
          break
        case "unlock":
          response = await apiService.unlockUserAccount(userId)
          break
        case "delete":
          if (window.confirm("Are you sure you want to delete this user?")) {
            response = await apiService.deleteUser(userId)
          } else {
            return
          }
          break
        default:
          return
      }
      
      // Refresh users list
      fetchUsers()
      
      // Show success message
      alert(response.data.message)
    } catch (err) {
      alert(err.response?.data?.error || "Action failed")
    }
  }

  const handleViewUser = async (userId) => {
    try {
      const response = await apiService.getUserDetails(userId)
      setSelectedUser(response.data)
      setShowUserDialog(true)
    } catch (err) {
      alert("Failed to fetch user details")
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      manager: "bg-purple-100 text-purple-800",
      staff: "bg-blue-100 text-blue-800",
      technician: "bg-green-100 text-green-800",
      user: "bg-gray-100 text-gray-800"
    }
    return colors[role] || colors.user
  }

  const getStatusBadge = (user) => {
    if (!user.is_active) {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    }
    if (!user.is_approved) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, view statistics, and monitor system security</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            Security Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="nursing">Nursing</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                            {getStatusBadge(user)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        
                        {!user.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, "approve")}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {user.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, "disapprove")}
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {user.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, "deactivate")}
                          >
                            <LockClosedIcon className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, "activate")}
                          >
                            <LockOpenIcon className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUserAction(user.id, "delete")}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.user_statistics.total_users}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{statistics.user_statistics.active_users}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{statistics.user_statistics.pending_approval}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Locked Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{statistics.user_statistics.locked_accounts}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Login Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading login attempts...</div>
              ) : (
                <div className="space-y-2">
                  {loginAttempts.slice(0, 20).map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          {attempt.user || attempt.attempted_username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {attempt.ip_address} • {new Date(attempt.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge className={attempt.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {attempt.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="font-medium">{selectedUser.department}</p>
                </div>
                <div>
                  <Label>Employee ID</Label>
                  <p className="font-medium">{selectedUser.employee_id || "N/A"}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedUser.phone_number || "N/A"}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="font-medium">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
              
              {selectedUser.statistics && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Total Login Attempts: {selectedUser.statistics.total_login_attempts}</div>
                    <div>Successful Logins: {selectedUser.statistics.successful_logins}</div>
                    <div>Failed Logins: {selectedUser.statistics.failed_logins}</div>
                    <div>Active Sessions: {selectedUser.statistics.active_sessions}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPanel
