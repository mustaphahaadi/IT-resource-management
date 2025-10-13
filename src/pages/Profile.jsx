import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api'
import {
  CameraIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    employee_id: '',
    bio: '',
    location: '',
    timezone: ''
  })
  const [activityStats, setActivityStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        department: user.department || '',
        employee_id: user.employee_id || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || 'UTC'
      })
    }
    fetchUserStats()
    fetchRecentActivity()
  }, [user])

  const fetchUserStats = async () => {
    try {
      const response = await apiService.get('/auth/user/stats/')
      setActivityStats(response.data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
      setActivityStats(null)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await apiService.get('/auth/user/activity/')
      setRecentActivity(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      setRecentActivity([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Only send fields expected by the backend UserProfileSerializer
      const allowedFields = ['first_name', 'last_name', 'email', 'phone_number', 'department', 'employee_id']
      const payload = Object.fromEntries(Object.entries(profileData).filter(([k]) => allowedFields.includes(k)))

      await apiService.updateProfile(payload)
      setMessage('Profile updated successfully!')
      setEditing(false)
      
      // Update auth context if available
      if (updateProfile) {
        updateProfile(profileData)
      }
    } catch (err) {
      // serializer errors are often returned as an object; show a readable message when possible
      const resp = err?.response?.data
      const friendly = resp?.message || (resp && typeof resp === 'object' ? JSON.stringify(resp) : resp)
      setError(friendly || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form data
    setProfileData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      department: user?.department || '',
      employee_id: user?.employee_id || '',
      bio: user?.bio || '',
      location: user?.location || '',
      timezone: user?.timezone || 'UTC'
    })
    setEditing(false)
    setError('')
    setMessage('')
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'request':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      case 'task':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'equipment':
        return <BuildingOfficeIcon className="w-4 h-4 text-blue-500" />
      case 'report':
        return <ChartBarIcon className="w-4 h-4 text-purple-500" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and view your activity</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} className="flex items-center space-x-2">
            <PencilIcon className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {/* Messages */}
      {message && (
        <Alert>
          <CheckCircleIcon className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    {editing && (
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-300 hover:bg-gray-50"
                      >
                        <CameraIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={profileData.phone_number}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={profileData.department}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      name="employee_id"
                      value={profileData.employee_id}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className=""
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={profileData.timezone}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 read-only:bg-gray-100 read-only:text-gray-700"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 read-only:bg-gray-100 read-only:text-gray-700"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {editing && (
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={handleCancel} className="border border-gray-300 text-gray-700 hover:bg-gray-50">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                <span>Account Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user?.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user?.is_email_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.is_email_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {activityStats?.member_since ? new Date(activityStats.member_since).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">
                  {activityStats?.last_login ? new Date(activityStats.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                <span>Activity Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requests Created</span>
                <span className="text-lg font-bold text-blue-600">{activityStats?.requests_created || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="text-lg font-bold text-green-600">{activityStats?.tasks_completed || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Equipment Managed</span>
                <span className="text-lg font-bold text-purple-600">{activityStats?.equipment_managed || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reports Generated</span>
                <span className="text-lg font-bold text-orange-600">{activityStats?.reports_generated || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
