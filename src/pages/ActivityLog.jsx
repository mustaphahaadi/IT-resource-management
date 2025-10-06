import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api'
import {
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ActivityLog = () => {
  const { user, hasPermission } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    user: '',
    action_type: '',
    resource_type: '',
    date_from: '',
    date_to: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchActivityLog()
  }, [filters, pagination.page])

  const fetchActivityLog = async () => {
    try {
      setLoading(true)
      setError("")
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      // Use available analytics endpoint for recent activity
      const response = await apiService.getRecentActivity({ limit: pagination.limit })
      const list = response.data?.activities || response.data?.results || response.data || []
      setActivities(Array.isArray(list) ? list : [])
      setPagination(prev => ({
        ...prev,
        total: Array.isArray(list) ? list.length : 0,
        pages: 1,
      }))
    } catch (error) {
      console.error('Error fetching activity log:', error)
      setError('Failed to load activity log.')
      setActivities([])
      setPagination(prev => ({ ...prev, total: 0, pages: 0 }))
    } finally {
      setLoading(false)
    }
  }

  const exportActivityLog = async () => {
    try {
      // Build CSV from current activities in memory
      const headers = ['id','type','title','description','user','timestamp','status','resource_type','resource_name']
      const rows = [headers.join(',')]
      for (const a of activities) {
        const safe = (v) => {
          if (v === undefined || v === null) return ''
          const s = String(v)
          // Escape quotes and wrap in quotes if contains comma or quote
          const esc = s.replace(/"/g, '""')
          return /[",\n]/.test(esc) ? `"${esc}"` : esc
        }
        rows.push([
          safe(a.id),
          safe(a.type || a.action_type || ''),
          safe(a.title || ''),
          safe(a.description || ''),
          safe(a.user?.username || (typeof a.user === 'string' ? a.user : '') ),
          safe(a.timestamp || ''),
          safe(a.status || ''),
          safe(a.resource_type || ''),
          safe(a.resource_name || ''),
        ].join(','))
      }
      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting activity log:', error)
    }
  }

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'create':
        return <ClipboardDocumentListIcon className="w-4 h-4 text-green-600" />
      case 'update':
        return <Cog6ToothIcon className="w-4 h-4 text-blue-600" />
      case 'delete':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
      case 'login':
      case 'logout':
        return <UserIcon className="w-4 h-4 text-purple-600" />
      case 'backup':
        return <DocumentArrowDownIcon className="w-4 h-4 text-orange-600" />
      default:
        return <EyeIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getResourceIcon = (resourceType) => {
    switch (resourceType) {
      case 'equipment':
        return <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />
      case 'request':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
      case 'task':
        return <ClipboardDocumentListIcon className="w-4 h-4 text-green-600" />
      case 'user':
        return <UserIcon className="w-4 h-4 text-purple-600" />
      case 'system':
        return <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
      default:
        return <EyeIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      case 'logout':
        return 'bg-gray-100 text-gray-800'
      case 'backup':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return time.toLocaleDateString()
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (!hasPermission('view_activity_log')) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You do not have permission to view the activity log.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-1">System activity and audit trail</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchActivityLog} variant="outline" disabled={loading}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportActivityLog} variant="outline">
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="backup">Backup</option>
            </select>

            <select
              value={filters.resource_type}
              onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Resources</option>
              <option value="equipment">Equipment</option>
              <option value="request">Requests</option>
              <option value="task">Tasks</option>
              <option value="user">Users</option>
              <option value="system">System</option>
            </select>

            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="From date"
            />

            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="To date"
            />

            <Button
              onClick={() => setFilters({
                user: '',
                action_type: '',
                resource_type: '',
                date_from: '',
                date_to: '',
                search: ''
              })}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-red-700">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-6 h-6 text-blue-600" />
              <span>Activities ({pagination.total})</span>
            </div>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading activity log..." />
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">No activities match your current filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {getActionIcon(activity.action_type)}
                      {getResourceIcon(activity.resource_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {activity.user?.first_name
                              ? `${activity.user.first_name} ${activity.user.last_name}`
                              : (activity.user || 'Unknown')}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action_type)}`}>
                            {activity.action_type}
                          </span>
                          {activity.resource_type && (
                            <span className="text-xs text-gray-500 capitalize">
                              {activity.resource_type}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                      )}
                      
                      {activity.resource_name && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Resource:</strong> {activity.resource_name}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          {activity.ip_address && <span>IP: {activity.ip_address}</span>}
                          {activity.user?.username && <span>User: @{activity.user.username}</span>}
                          {typeof activity.user === 'string' && !activity.user?.username && (
                            <span>User: {activity.user}</span>
                          )}
                        </div>
                        {activity.timestamp && (
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        )}
                      </div>
                      
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                            View Details
                          </summary>
                          <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(activity.details, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + Math.max(1, pagination.page - 2)
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                    >
                      {page}
                    </Button>
                  )
                })}
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ActivityLog
