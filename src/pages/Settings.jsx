import { useState, useEffect } from "react"
import { formatServerError } from "../lib/formatError"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../services/api"
import useOptions from "../hooks/useOptions"
import { 
  UserIcon, 
  KeyIcon, 
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const { options: departments, loading: loadingDepartments } = useOptions('/inventory/departments/', (d) => ({ value: d.code || d.slug || d.name, label: d.name || d.display_name || d.title }), [/* once */])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name, checked) => {
    setNotifications(prev => ({ ...prev, [name]: checked }))
  }

  const validateProfileForm = () => {
    const errors = []
    
    if (!profileData.first_name.trim()) errors.push("First name is required")
    if (!profileData.last_name.trim()) errors.push("Last name is required")
    if (!profileData.email.trim()) errors.push("Email is required")
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.push("Please enter a valid email address")
    }
    if (profileData.phone_number && !/^\+?1?\d{9,15}$/.test(profileData.phone_number)) {
      errors.push("Please enter a valid phone number")
    }
    
    return errors
  }

  const validatePasswordForm = () => {
    const errors = []
    
    if (!passwordData.current_password) errors.push("Current password is required")
    if (!passwordData.new_password) errors.push("New password is required")
    if (!passwordData.confirm_password) errors.push("Please confirm your new password")
    
    if (passwordData.new_password && passwordData.new_password.length < 8) {
      errors.push("New password must be at least 8 characters long")
    }
    if (passwordData.new_password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
      errors.push("New password must contain at least one uppercase letter, one lowercase letter, and one number")
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.push("New passwords do not match")
    }
    
    return errors
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    
    const validationErrors = validateProfileForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "))
      setLoading(false)
      return
    }
    
    try {
      await apiService.updateProfile(profileData)
      setMessage("Profile updated successfully")
      
      // Refresh user data
      const response = await apiService.get("/auth/profile/")
      // Update auth context if available
      if (updateProfile) {
        updateProfile(response.data)
      }
    } catch (err) {
  setError(formatServerError(err.response?.data, 'Failed to update profile'))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    
    const validationErrors = validatePasswordForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "))
      setLoading(false)
      return
    }
    
    try {
      await apiService.changePassword(
        passwordData.current_password,
        passwordData.new_password,
        passwordData.confirm_password
      )
      setMessage("Password changed successfully. Please log in again.")
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleNotificationSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    try {
      await apiService.updateNotificationPreferences(notifications)
      setMessage("Notification preferences updated successfully.")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update preferences.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {message && (
        <Alert className="mb-6">
          <CheckCircleIcon className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <KeyIcon className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellIcon className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={profileData.phone_number}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select 
                      value={profileData.department} 
                      onValueChange={(value) => handleSelectChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      name="employee_id"
                      type="text"
                      value={profileData.employee_id}
                      onChange={handleProfileChange}
                      placeholder="Enter your employee ID"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
                <div>
                  <Label>Account Status</Label>
                  <p className="font-medium">
                    {user?.is_approved ? (
                      <span className="text-green-600">Approved</span>
                    ) : (
                      <span className="text-yellow-600">Pending Approval</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label>Email Verified</Label>
                  <p className="font-medium">
                    {user?.is_email_verified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-red-600">Not Verified</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="font-medium">
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      name="current_password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      name="new_password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Changing Password..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email for important updates.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email_notifications}
                      onChange={(e) => handleNotificationChange("email_notifications", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about critical security events.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.security_alerts}
                      onChange={(e) => handleNotificationChange("security_alerts", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive information about system maintenance and new features.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.system_updates}
                      onChange={(e) => handleNotificationChange("system_updates", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <ShieldCheckIcon className="h-4 w-4" />
                <AlertDescription>
                  Your data is protected and only accessible to authorized personnel. 
                  Contact your IT administrator for data export or deletion requests.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Data Collection</h4>
                  <p className="text-sm text-muted-foreground">
                    We collect minimal data necessary for system operation and security monitoring.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Session Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Login sessions are tracked for security purposes and automatically expire after inactivity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
