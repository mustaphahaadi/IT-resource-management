import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import { apiService } from "../services/api"

const Dashboard = () => {
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
      // Fetch real analytics data from backend
      const [analyticsResponse, activityResponse] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getRecentActivity({ limit: 10 })
      ])

      setAnalytics(analyticsResponse.data)
      setRecentActivity(activityResponse.data.results || activityResponse.data || [])

      // Update stats state with actual data from backend
      setStats({
        equipment: analyticsResponse.data.equipmentStats,
        requests: analyticsResponse.data.requestStats,
        tasks: analyticsResponse.data.taskStats,
      })
    } catch (err) {
      setError("Failed to load dashboard data.")
      console.error('Dashboard data fetch error:', err)

      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using fallback mock data for dashboard')
        const mockAnalytics = {
          performanceMetrics: {
            systemUptime: 99.2,
            avgResponseTime: 2.4,
            resolutionRate: 87.3,
            activePersonnel: 12
          },
          equipmentStats: {
            total: 156,
            active: 142,
            maintenance: 8,
            critical: 6
          },
          requestStats: {
            total: 89,
            open: 23,
            critical: 6,
            overdue: 4
          },
          taskStats: {
            total: 45,
            pending: 12,
            in_progress: 18,
            overdue: 3
          }
        }

        const mockActivity = [
          {
            id: 1,
            type: 'equipment',
            message: 'MRI Scanner maintenance completed',
            user: 'John Smith',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            type: 'request',
            message: 'Critical network issue resolved in ICU',
            user: 'Sarah Johnson',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            type: 'task',
            message: 'Software update deployed to Radiology',
            user: 'Mike Davis',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          }
        ]

        setAnalytics(mockAnalytics)
        setRecentActivity(mockActivity)
        setError("") // Clear error when using fallback data
      }
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
    const totalEquipment = stats.equipment.total
    const activeEquipment = stats.equipment.active
    return totalEquipment > 0 ? ((activeEquipment / totalEquipment) * 100).toFixed(1) : 0
  }

  const calculateResponseTime = () => {
    return analytics.performanceMetrics?.avgResponseTime || 0
  }

  const calculateResolutionRate = () => {
    const totalRequests = stats.requests.total
    const resolvedRequests = totalRequests - stats.requests.open
    return totalRequests > 0 ? ((resolvedRequests / totalRequests) * 100).toFixed(1) : 0
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of hospital IT infrastructure and operations</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
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
            value={analytics.performanceMetrics?.activePersonnel || 0}
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'equipment' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'request' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'equipment' ? (
                        <ComputerDesktopIcon className="w-4 h-4" />
                      ) : activity.type === 'request' ? (
                        <ExclamationTriangleIcon className="w-4 h-4" />
                      ) : (
                        <ClipboardDocumentListIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {activity.user} • {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                Add New Equipment
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Create Support Request
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                Generate Report
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Emergency Response
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${
                      alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {alert.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
