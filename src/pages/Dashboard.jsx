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
        navigate('/app/requests/new')
        break
      case 'newTask':
        navigate('/app/tasks/new')
        break
      case 'reportIssue':
        navigate('/app/requests/new?type=issue')
        break
      default:
        break
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch analytics data
      const analyticsResponse = await apiService.getDashboardAnalytics()
      if (analyticsResponse?.data) {
        setAnalytics(analyticsResponse.data)
        
        // Map analytics to stats format
        const analyticsData = analyticsResponse.data
        setStats({
          equipment: {
            total: analyticsData.total_equipment || 0,
            active: analyticsData.active_equipment || 0,
            maintenance: analyticsData.maintenance_equipment || 0,
            critical: analyticsData.critical_equipment || 0
          },
          requests: {
            total: analyticsData.total_requests || 0,
            open: analyticsData.open_requests || 0,
            critical: analyticsData.critical_requests || 0,
            overdue: analyticsData.overdue_requests || 0
          },
          tasks: {
            total: analyticsData.total_tasks || 0,
            pending: analyticsData.pending_tasks || 0,
            in_progress: analyticsData.in_progress_tasks || 0,
            overdue: analyticsData.overdue_tasks || 0
          }
        })
      }

      // Fetch recent activity
      try {
        const activityResponse = await apiService.getRecentActivity({ limit: 10 })
        if (activityResponse?.data?.results) {
          setRecentActivity(activityResponse.data.results)
        } else if (Array.isArray(activityResponse?.data)) {
          setRecentActivity(activityResponse.data)
        }
      } catch (activityError) {
        console.warn('Failed to fetch recent activity:', activityError)
      }

      // Fetch alerts
      try {
        const alertsResponse = await apiService.getAlerts({ limit: 5 })
        if (alertsResponse?.data?.results) {
          setAlerts(alertsResponse.data.results)
        } else if (Array.isArray(alertsResponse?.data)) {
          setAlerts(alertsResponse.data)
        }
      } catch (alertsError) {
        console.warn('Failed to fetch alerts:', alertsError)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    setRefreshInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

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

  const formatActivityTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const handleActivityClick = (activity) => {
    if (activity.type === 'request' && activity.id) {
      navigate(`/app/requests/${activity.id}`)
    } else if (activity.type === 'task' && activity.id) {
      navigate(`/app/tasks/${activity.id}`)
    }
  }

  const handleAlertClick = (alert) => {
    if (alert.id) {
      navigate(`/app/alerts/${alert.id}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of your hospital's IT resources and activities
            {user?.department && (
              <span className="ml-2 text-blue-600">
                • {user.department.charAt(0).toUpperCase() + user.department.slice(1)} Department
              </span>
            )}
          </p>
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

      {/* Role-based welcome message */}
      <RoleGate roles={['user']} fallback={null}>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-blue-800">
              Welcome! You can submit support requests and track your tickets here. 
              Need help? Use the "Report Issue" button above.
            </p>
          </CardContent>
        </Card>
      </RoleGate>

      {/* Equipment Stats - Visible to all but scoped by role */}
      <PermissionGate permissions="nav.equipment">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Equipment Overview
            {!canViewScope('all') && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Your Department)
              </span>
            )}
          </h2>
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
      </PermissionGate>

      {/* Support Requests */}
      <PermissionGate permissions="nav.requests">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Support Requests
            {!canViewScope('all') && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Your Requests)
              </span>
            )}
          </h2>
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
              subtitle="High priority"
              icon={ExclamationTriangleIcon}
              color="red"
            />
            <StatCard
              title="Overdue Requests"
              value={stats.requests.overdue}
              subtitle="Past SLA deadline"
              icon={ClockIcon}
              color="red"
            />
          </div>
        </div>
      </PermissionGate>

      {/* Tasks - Only for staff and technicians */}
      <PermissionGate permissions="nav.tasks">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Task Management
            {!canViewScope('all') && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Assigned to You)
              </span>
            )}
          </h2>
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
              icon={ClockIcon}
              color="red"
            />
          </div>
        </div>
      </PermissionGate>

      {/* Recent Activity and Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/app/activity-log')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
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
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <div 
                      key={activity.id || index} 
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
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No recent activity found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <CardTitle className="text-lg">System Alerts</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/app/notifications')}
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
                {alerts.slice(0, 3).map((alert, index) => (
                  <div 
                    key={alert.id || index} 
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
                      <span className="text-xs text-red-500 whitespace-nowrap ml-2">
                        {formatActivityTime(alert.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
