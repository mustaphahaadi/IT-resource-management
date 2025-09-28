import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { usePermissions, PermissionGate, RoleGate } from "../../contexts/PermissionsContext"
import { apiService } from "../../services/api"
import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BellIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  PlayIcon,
  PlusIcon
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"

const UnifiedDashboard = ({ onNavigate }) => {
  const { user, userRole, hasPermission, canViewScope } = usePermissions()
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivity: [],
    alerts: [],
    myTasks: [],
    upcomingDeadlines: [],
    systemHealth: {},
    workloadMetrics: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [userRole])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError("")

      const promises = []

      // Core analytics data
      promises.push(
        apiService.getDashboardAnalytics().catch(err => {
          console.warn('Analytics data unavailable:', err)
          return { data: {} }
        })
      )

      // Recent activity
      promises.push(
        apiService.getRecentActivity({ limit: 10 }).catch(err => {
          console.warn('Recent activity unavailable:', err)
          return { data: [] }
        })
      )

      // System alerts
      promises.push(
        apiService.getAlerts({ limit: 5 }).catch(err => {
          console.warn('Alerts unavailable:', err)
          return { data: [] }
        })
      )

      // Role-specific data
      if (userRole === 'technician' || userRole === 'staff' || userRole === 'admin') {
        // My tasks for technicians
        promises.push(
          apiService.getMyTasks('assigned,in_progress').catch(err => {
            console.warn('My tasks unavailable:', err)
            return { data: [] }
          })
        )

        // Technician dashboard stats
        promises.push(
          apiService.getTechnicianDashboard().catch(err => {
            console.warn('Technician dashboard unavailable:', err)
            return { data: { stats: {}, upcoming_tasks: [] } }
          })
        )
      }

      const results = await Promise.all(promises)

      // Process results
      const [analyticsRes, activityRes, alertsRes, tasksRes, techDashRes] = results

      setDashboardData({
        stats: analyticsRes?.data || {},
        recentActivity: Array.isArray(activityRes?.data) ? activityRes.data : activityRes?.data?.results || [],
        alerts: Array.isArray(alertsRes?.data) ? alertsRes.data : alertsRes?.data?.results || [],
        myTasks: Array.isArray(tasksRes?.data) ? tasksRes.data : tasksRes?.data?.results || [],
        upcomingDeadlines: techDashRes?.data?.upcoming_tasks || [],
        workloadMetrics: techDashRes?.data?.stats || {},
        systemHealth: {
          uptime: analyticsRes?.data?.system_uptime || 99.5,
          responseTime: analyticsRes?.data?.avg_resolution_time || 2.5,
          activeUsers: analyticsRes?.data?.total_users || 0
        }
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleQuickAction = (action, data = {}) => {
    switch (action) {
      case 'createRequest':
        onNavigate?.('/app/requests/new')
        break
      case 'createTask':
        onNavigate?.('/app/tasks/new')
        break
      case 'viewTask':
        onNavigate?.(`/app/tasks/${data.id}`)
        break
      case 'viewRequest':
        onNavigate?.(`/app/requests/${data.id}`)
        break
      case 'viewEquipment':
        onNavigate?.('/app/inventory')
        break
      case 'viewReports':
        onNavigate?.('/app/reports')
        break
      default:
        break
    }
  }

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'assigned': 'bg-purple-100 text-purple-800 border-purple-200',
      'pending': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || colors.pending
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend, onClick }) => (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>
              {loading ? "..." : value}
            </p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trend.direction === 'up' ? (
              <TrendingUpIcon className="w-3 h-3 text-green-500 mr-1" />
            ) : (
              <TrendingDownIcon className="w-3 h-3 text-red-500 mr-1" />
            )}
            <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trend.percentage}% from last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your hospital IT system
            {user?.department && (
              <span className="ml-2 text-blue-600">
                • {user.department.charAt(0).toUpperCase() + user.department.slice(1)} Department
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permissions="requests.create">
            <Button onClick={() => handleQuickAction('createRequest')} className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              New Request
            </Button>
          </PermissionGate>
          <Button onClick={fetchDashboardData} variant="outline" disabled={refreshing}>
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Role-specific welcome message */}
      <RoleGate roles={['user']}>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <BellIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Need IT Support?</h3>
                <p className="text-blue-800 text-sm">
                  Submit a support request and our team will help you quickly. 
                  Track your requests and get updates in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RoleGate>

      {/* System Health - Admin/Staff only */}
      <PermissionGate permissions="admin.analytics">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="System Uptime"
              value={`${dashboardData.systemHealth.uptime}%`}
              subtitle="Last 30 days"
              icon={ChartBarIcon}
              color="green"
            />
            <StatCard
              title="Avg Response Time"
              value={`${dashboardData.systemHealth.responseTime}h`}
              subtitle="Support requests"
              icon={ClockIcon}
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={dashboardData.systemHealth.activeUsers}
              subtitle="Currently online"
              icon={UserGroupIcon}
              color="purple"
            />
          </div>
        </div>
      </PermissionGate>

      {/* My Workload - Technicians */}
      <RoleGate roles={['technician', 'staff', 'admin']}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Workload</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Active Tasks"
              value={dashboardData.workloadMetrics.active_tasks || 0}
              subtitle={`${Math.round(dashboardData.workloadMetrics.workload_percentage || 0)}% capacity`}
              icon={ClipboardDocumentListIcon}
              color="blue"
              onClick={() => handleQuickAction('viewTask')}
            />
            <StatCard
              title="Overdue"
              value={dashboardData.workloadMetrics.overdue_tasks || 0}
              subtitle="Need attention"
              icon={ClockIcon}
              color="red"
            />
            <StatCard
              title="Critical Priority"
              value={dashboardData.workloadMetrics.critical_tasks || 0}
              subtitle="High priority"
              icon={ExclamationTriangleIcon}
              color="orange"
            />
            <StatCard
              title="Completed Today"
              value={dashboardData.workloadMetrics.completed_today || 0}
              subtitle="Tasks finished"
              icon={CheckCircleIcon}
              color="green"
            />
          </div>
        </div>
      </RoleGate>

      {/* Overview Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Overview
          {!canViewScope('all') && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Your {canViewScope('department') ? 'Department' : 'Data'})
            </span>
          )}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PermissionGate permissions="nav.equipment">
            <StatCard
              title="Equipment"
              value={dashboardData.stats.total_equipment || 0}
              subtitle={`${dashboardData.stats.active_equipment || 0} active`}
              icon={ComputerDesktopIcon}
              color="blue"
              onClick={() => handleQuickAction('viewEquipment')}
            />
          </PermissionGate>
          
          <PermissionGate permissions="nav.requests">
            <StatCard
              title="Support Requests"
              value={dashboardData.stats.total_requests || 0}
              subtitle={`${dashboardData.stats.open_requests || 0} open`}
              icon={ExclamationTriangleIcon}
              color="orange"
              onClick={() => handleQuickAction('viewRequest')}
            />
          </PermissionGate>
          
          <PermissionGate permissions="nav.tasks">
            <StatCard
              title="Tasks"
              value={dashboardData.stats.total_tasks || 0}
              subtitle={`${dashboardData.stats.in_progress_tasks || 0} in progress`}
              icon={ClipboardDocumentListIcon}
              color="purple"
              onClick={() => handleQuickAction('viewTask')}
            />
          </PermissionGate>
          
          <StatCard
            title="Critical Issues"
            value={(dashboardData.stats.critical_requests || 0) + (dashboardData.stats.critical_equipment || 0)}
            subtitle="Require attention"
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Tasks - Technicians */}
        <RoleGate roles={['technician', 'staff', 'admin']}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Active Tasks</span>
                <Badge variant="secondary">{dashboardData.myTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dashboardData.myTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <ClipboardDocumentListIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No active tasks</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {dashboardData.myTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 mb-1">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge size="sm" className={getStatusColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge size="sm" className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {task.due_date && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due {formatTimeAgo(task.due_date)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          {task.status === 'assigned' && (
                            <Button size="sm" variant="outline" onClick={() => handleQuickAction('startTask', task)}>
                              <PlayIcon className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleQuickAction('viewTask', task)}>
                            <EyeIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </RoleGate>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData.recentActivity.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index} className="p-3 hover:bg-gray-50 transition-colors">
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
                        {formatTimeAgo(activity.timestamp || activity.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border-l-4 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dashboardData.alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-300" />
                <p className="text-sm">All systems normal</p>
              </div>
            ) : (
              <div className="divide-y divide-red-100">
                {dashboardData.alerts.slice(0, 3).map((alert, index) => (
                  <div key={alert.id || index} className="p-3 hover:bg-red-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-800">{alert.title || 'Alert'}</p>
                        <p className="text-xs text-red-700 mt-1">
                          {alert.message || 'No details available'}
                        </p>
                      </div>
                      <span className="text-xs text-red-500 whitespace-nowrap ml-2">
                        {formatTimeAgo(alert.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <PermissionGate permissions="requests.create">
              <Button variant="outline" onClick={() => handleQuickAction('createRequest')} className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                New Request
              </Button>
            </PermissionGate>
            
            <PermissionGate permissions="tasks.create">
              <Button variant="outline" onClick={() => handleQuickAction('createTask')} className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                New Task
              </Button>
            </PermissionGate>
            
            <PermissionGate permissions="nav.equipment">
              <Button variant="outline" onClick={() => handleQuickAction('viewEquipment')} className="flex items-center gap-2">
                <ComputerDesktopIcon className="w-4 h-4" />
                View Equipment
              </Button>
            </PermissionGate>
            
            <PermissionGate permissions="nav.reports">
              <Button variant="outline" onClick={() => handleQuickAction('viewReports')} className="flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4" />
                View Reports
              </Button>
            </PermissionGate>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnifiedDashboard
