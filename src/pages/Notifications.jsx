import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Notifications = () => {
  const { user, markNotificationRead, markAllNotificationsRead } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [filters, setFilters] = useState({
    status: 'all', // all, read, unread
    type: 'all', // all, system, request, task, equipment
    priority: 'all', // all, critical, high, medium, low
    search: ''
  })
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    system_alerts: true,
    request_updates: true,
    task_assignments: true,
    equipment_alerts: true,
    maintenance_reminders: true
  })

  useEffect(() => {
    fetchNotifications()
    fetchNotificationSettings()
  }, [filters])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        ...filters,
        limit: 50
      }
      // Map UI filters to backend-supported params
      if (params.status === 'unread') {
        params.unread_only = true
      }
      // Backend uses 'maintenance' type instead of 'equipment'
      if (params.type === 'equipment') {
        params.type = 'maintenance'
      }
      
      // Remove 'all' values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all') {
          delete params[key]
        }
      })
      delete params.status

      const response = await apiService.getNotifications(params)
      const list = response.data?.notifications || response.data?.results || response.data || []
      setNotifications(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const response = await apiService.getNotificationPreferences()
      const prefs = response.data || {}
      const hasEmail = (v) => v === 'email' || v === 'both'
      const hasWeb = (v) => v === 'web' || v === 'both'
      const sys = prefs.system_notifications
      const req = prefs.request_notifications
      const task = prefs.task_notifications
      const maint = prefs.maintenance_notifications
      setNotificationSettings(prev => ({
        // Global channel toggles derived from any type having the channel
        email_notifications: [sys, req, task, maint].some(hasEmail),
        push_notifications: [sys, req, task, maint].some(hasWeb),
        // Per-type enable/disable
        system_alerts: sys !== 'none' && !!sys,
        request_updates: req !== 'none' && !!req,
        task_assignments: task !== 'none' && !!task,
        maintenance_reminders: maint !== 'none' && !!maint,
        // Keep equipment_alerts as-is (not supported in backend preferences)
        equipment_alerts: prev.equipment_alerts,
      }))
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      )
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url
    }
  }

  const handleMarkAsRead = async (notificationIds) => {
    try {
      for (const id of notificationIds) {
        await markNotificationRead(id)
      }
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        )
      )
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotifications = async (notificationIds) => {
    try {
      for (const id of notificationIds) {
        await apiService.dismissNotification(id)
      }
      setNotifications(prev =>
        prev.filter(n => !notificationIds.includes(n.id))
      )
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
  }

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    const visibleNotificationIds = filteredNotifications.map(n => n.id)
    setSelectedNotifications(
      selectedNotifications.length === visibleNotificationIds.length
        ? []
        : visibleNotificationIds
    )
  }

  const handleSettingsChange = async (setting, value) => {
    const newSettings = { ...notificationSettings, [setting]: value }
    setNotificationSettings(newSettings)
    
    // Map UI booleans to backend delivery choices per type
    const computePref = (enabled, emailOn, pushOn) => {
      if (!enabled) return 'none'
      if (emailOn && pushOn) return 'both'
      if (emailOn) return 'email'
      if (pushOn) return 'web'
      return 'none'
    }

    const prefsPayload = {
      system_notifications: computePref(newSettings.system_alerts, newSettings.email_notifications, newSettings.push_notifications),
      request_notifications: computePref(newSettings.request_updates, newSettings.email_notifications, newSettings.push_notifications),
      task_notifications: computePref(newSettings.task_assignments, newSettings.email_notifications, newSettings.push_notifications),
      maintenance_notifications: computePref(newSettings.maintenance_reminders, newSettings.email_notifications, newSettings.push_notifications),
    }

    try {
      await apiService.updateNotificationPreferences(prefsPayload)
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }

  const getNotificationIcon = (type, priority) => {
    if (priority === 'critical') {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
    }
    
    switch (type) {
      case 'system':
        return <Cog6ToothIcon className="w-5 h-5 text-blue-500" />
      case 'request':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
      case 'task':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'equipment':
        return <ExclamationTriangleIcon className="w-5 h-5 text-purple-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(notification => {
    if (filters.status !== 'all') {
      if (filters.status === 'read' && !notification.is_read) return false
      if (filters.status === 'unread' && notification.is_read) return false
    }
    
    if (filters.type !== 'all') {
      const typeToMatch = filters.type === 'equipment' ? 'maintenance' : filters.type
      if (notification.type !== typeToMatch) return false
    }
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return notification.title.toLowerCase().includes(searchLower) ||
             notification.message.toLowerCase().includes(searchLower)
    }
    
    return true
  })

  const unreadCount = filteredNotifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Manage your notifications and preferences ({unreadCount} unread)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Settings</span>
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckIcon className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries({
                email_notifications: 'Email Notifications',
                push_notifications: 'Push Notifications',
                system_alerts: 'System Alerts',
                request_updates: 'Support Request Updates',
                task_assignments: 'Task Assignments',
                equipment_alerts: 'Equipment Alerts',
                maintenance_reminders: 'Maintenance Reminders'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type="checkbox"
                    checked={notificationSettings[key]}
                    onChange={(e) => handleSettingsChange(key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-red-700">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="request">Requests</option>
              <option value="task">Tasks</option>
              <option value="equipment">Equipment</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex space-x-2">
              {selectedNotifications.length > 0 && (
                <>
                  <Button
                    onClick={() => handleMarkAsRead(selectedNotifications)}
                    size="sm"
                    variant="outline"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteNotifications(selectedNotifications)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BellIcon className="w-6 h-6 text-blue-600" />
              <span>Notifications ({filteredNotifications.length})</span>
            </CardTitle>
            {filteredNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading notifications..." />
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {Object.values(filters).some(f => f && f !== 'all') 
                  ? "No notifications match your current filters" 
                  : "You're all caught up!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 p-4 rounded-r-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    getPriorityColor(notification.priority)
                  } ${!notification.is_read ? 'bg-blue-50' : 'bg-white'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleSelectNotification(notification.id)
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {notification.priority}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {notification.type}
                          </span>
                        </div>
                        {notification.action_url && (
                          <Button size="sm" variant="outline">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifications
