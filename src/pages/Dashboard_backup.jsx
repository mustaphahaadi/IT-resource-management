import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { usePermissions, PermissionGate, RoleGate } from "../contexts/PermissionsContext"
import {
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../services/api"
import { formatDistanceToNow } from "date-fns"

const Dashboard = () => {
  const navigate = useNavigate()
  const { hasPermission, userRole, user, canViewScope } = usePermissions()
  const [stats, setStats] = useState({
    equipment: { total: 0, active: 0, maintenance: 0, critical: 0 },
    requests: { total: 0, open: 0, critical: 0, overdue: 0 },
    tasks: { total: 0, pending: 0, in_progress: 0, overdue: 0 },
  })
  const [analytics, setAnalytics] = useState({
    equipmentTrends: [],
    requestTrends: [],
    taskTrends: [],
    performanceMetrics: {},
    departmentStats: [],
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshInterval, setRefreshInterval] = useState(null)
  
  // Quick action handlers
  const handleQuickAction = (action) => {
    switch(action) {
      case 'newRequest':
        navigate('/requests/new')
        break
      case 'newTask':
        navigate('/tasks/new')
        break
      case 'reportIssue':
        navigate('/reports/issue')
        break
      case 'viewAnalytics':
        navigate('/analytics')
        break
      default:
        break
    }
  }
  
  // Format activity timestamp
  const formatActivityTime = (timestamp) => {
    if (!timestamp) return ''
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (e) {
      return ''
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    setRefreshInterval(interval)

    return () => {
      if (refreshInterval) clearInterval(refreshInterval)
    }
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError("")
    try {
      // Check if user is authenticated
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error('No auth token found, redirecting to login')
        navigate('/login')
        return
      }

      // Fetch real analytics data from backend
      const [analyticsResponse, activityResponse] = await Promise.allSettled([
        apiService.getDashboardAnalytics(),
        apiService.getRecentActivity({ limit: 10 })
      ])

      // Handle analytics response
      if (analyticsResponse.status === 'fulfilled') {
        const data = analyticsResponse.value?.data || {}
        
        // Update analytics state
        setAnalytics({
          equipmentTrends: data.equipment_trends || [],
          requestTrends: data.request_trends || [],
          taskTrends: data.task_trends || [],
          performanceMetrics: data.performance_metrics || {},
          departmentStats: data.department_stats || [],
        })
        
        // Update stats state with the same data
        setStats({
          equipment: data.equipment || { total: 0, active: 0, maintenance: 0, critical: 0 },
          requests: data.requests || { total: 0, open: 0, critical: 0, overdue: 0 },
          tasks: data.tasks || { total: 0, pending: 0, in_progress: 0, overdue: 0 },
        })
      } else {
        console.error('Failed to fetch analytics:', analyticsResponse.reason)
        if (analyticsResponse.reason?.response?.status === 403) {
          setError('You do not have permission to view this data')
        } else {
          setError('Failed to load analytics data. Please try again later.')
        }
      }

      // Handle activity response
      if (activityResponse.status === 'fulfilled') {
        // Recent activity endpoint returns { activities: [...] }
        setRecentActivity(activityResponse.value?.data?.activities || [])
      } else {
        console.error('Failed to fetch recent activity:', activityResponse.reason)
        // Don't show error for activity feed as it's not critical
      }
    } catch (err) {
      setError("Failed to load dashboard data.")
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend }) => (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{loading ? "..." : value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div
            className={`text-xs mt-2 flex items-center ${
              trend.direction === "up" ? "text-green-600" : 
              trend.direction === "down" ? "text-red-600" : 
              "text-gray-600"
            }`}
          >
            <span className="mr-1">
              {trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "→"}
            </span>
            {trend.percentage}% from last week
          </div>
        )}
      </CardContent>
    </Card>
  )

  const calculateUptime = () => {
    // Prefer backend metric if available, else compute from equipment stats
    if (analytics.performanceMetrics?.system_uptime !== undefined) {
      return analytics.performanceMetrics.system_uptime
    }
    const totalEquipment = stats.equipment.total
    const activeEquipment = stats.equipment.active
    return totalEquipment > 0 ? ((activeEquipment / totalEquipment) * 100).toFixed(1) : 0
  }

  const calculateResponseTime = () => {
    // Backend provides avg_resolution_time (hours)
    return analytics.performanceMetrics?.avg_resolution_time || 0
  }

  const calculateResolutionRate = () => {
    const totalRequests = stats.requests.total
    const resolvedRequests = totalRequests - stats.requests.open
    return totalRequests > 0 ? ((resolvedRequests / totalRequests) * 100).toFixed(1) : 0
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your hospital's IT resources and activities</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PermissionGate permissions="requests.create">
            <Button 
              variant="outline" 
              onClick={() => handleQuickAction('newRequest')}
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Request</span>
            </Button>
          </PermissionGate>
          <PermissionGate permissions="tasks.create">
            <Button 
              variant="outline" 
              onClick={() => handleQuickAction('newTask')}
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          </PermissionGate>
          <Button 
            variant="outline" 
            onClick={() => handleQuickAction('reportIssue')}
            className="flex items-center gap-1"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>Report Issue</span>
          </Button>
          <Button 
            onClick={fetchDashboardData}
            variant="outline"
            className="ml-auto"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Performance</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="System Uptime"
            value={`${calculateUptime()}%`}
            subtitle="Equipment availability"
            icon={ChartBarIcon}
            color="green"
            trend={{ direction: "up", percentage: 2.3 }}
          />
          <StatCard
            title="Avg Response Time"
            value={`${calculateResponseTime()}h`}
            subtitle="Support request response"
            icon={ClockIcon}
            color="blue"
            trend={{ direction: "down", percentage: 15.2 }}
          />
          <StatCard
            title="Resolution Rate"
            value={`${calculateResolutionRate()}%`}
            subtitle="Successful resolutions"
            icon={ChartBarIcon}
            color="purple"
            trend={{ direction: "up", percentage: 8.7 }}
          />
          <StatCard
            title="Active Personnel"
            value={analytics.performanceMetrics?.total_users || 0}
            subtitle="IT staff on duty"
            icon={UserGroupIcon}
            color="indigo"
          />
        </div>
      </div>

      {/* Equipment Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Equipment Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Equipment" 
            value={stats.equipment.total} 
            icon={ComputerDesktopIcon}
            color="blue"
            subtitle="All registered devices"
          />
          <StatCard
            title="Active Equipment"
            value={stats.equipment.active}
            subtitle="Operational status"
            icon={ComputerDesktopIcon}
            color="green"
          />
          <StatCard
            title="Under Maintenance"
            value={stats.equipment.maintenance}
            subtitle="Scheduled maintenance"
            icon={WrenchScrewdriverIcon}
            color="yellow"
          />
          <StatCard
            title="Critical Priority"
            value={stats.equipment.critical}
            subtitle="Requires attention"
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>
      </div>

      {/* Support Requests Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Support Requests</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Requests" 
            value={stats.requests.total} 
            icon={ExclamationTriangleIcon}
            color="blue"
            subtitle="All support tickets"
          />
          <StatCard
            title="Open Requests"
            value={stats.requests.open}
            subtitle="Awaiting resolution"
            icon={ExclamationTriangleIcon}
            color="orange"
          />
          <StatCard
            title="Critical Requests"
            value={stats.requests.critical}
            subtitle="Patient care impact"
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <StatCard
            title="Overdue Requests"
            value={stats.requests.overdue}
            subtitle="Past SLA deadline"
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>
      </div>

      {/* Tasks Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Task Management</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Tasks" 
            value={stats.tasks.total} 
            icon={ClipboardDocumentListIcon}
            color="blue"
            subtitle="All assigned tasks"
          />
          <StatCard
            title="Pending Assignment"
            value={stats.tasks.pending}
            subtitle="Awaiting assignment"
            icon={ClipboardDocumentListIcon}
            color="gray"
          />
          <StatCard
            title="In Progress"
            value={stats.tasks.in_progress}
            subtitle="Currently active"
            icon={ClipboardDocumentListIcon}
            color="blue"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.tasks.overdue}
            subtitle="Past due date"
            icon={ClipboardDocumentListIcon}
            color="red"
          />
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/activity')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-red-500">{error}</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div 
                      key={activity.id} 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title || 'Activity'}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {formatActivityTime(activity.timestamp || activity.created_at)}
                        </span>
                      </div>
                      {activity.type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2"
                          style={{
                            backgroundColor: getActivityTypeColor(activity.type).bg,
                            color: getActivityTypeColor(activity.type).text
                          }}>
                          {getActivityTypeLabel(activity.type)}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No recent activity found</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-blue-600"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <CardTitle className="text-lg">Alerts</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/alerts')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="divide-y divide-red-100">
                {alerts.slice(0, 3).map((alert) => (
                  <div 
                    key={alert.id} 
                    className="p-4 hover:bg-red-50 cursor-pointer transition-colors"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-red-800">{alert.title || 'Alert'}</p>
                        <p className="text-xs text-red-700 mt-1">
                          {alert.message || 'No details available'}
                        </p>
                      </div>
                      <span className="text-xs text-red-400 whitespace-nowrap ml-2">
                        {formatActivityTime(alert.timestamp || alert.created_at)}
                      </span>
                    </div>
                    {alert.severity && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 bg-red-100 text-red-800">
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    )}
                  </div>
                ))}
                {alerts.length > 3 && (
                  <div className="p-4 text-center border-t border-red-100">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/alerts')}
                      className="text-red-600 hover:text-red-800"
                    >
                      View all {alerts.length} alerts
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No active alerts</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-blue-600"
                  onClick={fetchDashboardData}
                >
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to get activity type styling
const getActivityTypeColor = (type) => {
  const types = {
    request: { bg: '#DBEAFE', text: '#1E40AF' },
    task: { bg: '#D1FAE5', text: '#065F46' },
    alert: { bg: '#FEE2E2', text: '#B91C1C' },
    system: { bg: '#E0E7FF', text: '#3730A3' },
    default: { bg: '#F3F4F6', text: '#4B5563' }
  }
  return types[type] || types.default
}

// Helper function to get activity type label
const getActivityTypeLabel = (type) => {
  const labels = {
    request: 'Request',
    task: 'Task',
    alert: 'Alert',
    system: 'System',
    default: 'Activity'
  }
  return labels[type] || labels.default
}

export default Dashboard
