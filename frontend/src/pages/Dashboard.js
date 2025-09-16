"use client"

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
import DashboardCharts from "../components/Dashboard/DashboardCharts"
import ActivityFeed from "../components/Dashboard/ActivityFeed"
import AlertsPanel from "../components/Dashboard/AlertsPanel"

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
    try {
      const [equipmentStats, requestStats, taskStats, analyticsData, activityData, alertsData] = await Promise.all([
        apiService.get("/inventory/equipment/dashboard_stats/"),
        apiService.get("/requests/support-requests/dashboard_stats/"),
        apiService.get("/tasks/tasks/dashboard_stats/"),
        apiService.get("/analytics/dashboard/"),
        apiService.get("/activity/recent/"),
        apiService.get("/alerts/active/"),
      ])

      setStats({
        equipment: equipmentStats.data,
        requests: requestStats.data,
        tasks: taskStats.data,
      })

      setAnalytics(analyticsData.data)
      setRecentActivity(activityData.data.results || activityData.data)
      setAlerts(alertsData.data.results || alertsData.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "primary", trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-4 h-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{loading ? "..." : value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div
            className={`text-xs mt-1 ${trend.direction === "up" ? "text-green-600" : trend.direction === "down" ? "text-red-600" : "text-gray-600"}`}
          >
            {trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "→"} {trend.percentage}% from last week
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IT Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of hospital IT infrastructure and operations</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          >
            Refresh
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">System Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="System Uptime"
            value={`${calculateUptime()}%`}
            subtitle="Equipment availability"
            icon={ChartBarIcon}
            color="primary"
            trend={{ direction: "up", percentage: 2.3 }}
          />
          <StatCard
            title="Avg Response Time"
            value={`${calculateResponseTime()}h`}
            subtitle="Support request response"
            icon={ClockIcon}
            color="primary"
            trend={{ direction: "down", percentage: 15.2 }}
          />
          <StatCard
            title="Resolution Rate"
            value={`${calculateResolutionRate()}%`}
            subtitle="Successful resolutions"
            icon={ChartBarIcon}
            color="primary"
            trend={{ direction: "up", percentage: 8.7 }}
          />
          <StatCard
            title="Active Personnel"
            value={analytics.performanceMetrics?.activePersonnel || 0}
            subtitle="IT staff on duty"
            icon={UserGroupIcon}
            color="primary"
          />
        </div>
      </div>

      {/* Equipment Stats */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Equipment Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Equipment" value={stats.equipment.total} icon={ComputerDesktopIcon} />
          <StatCard
            title="Active Equipment"
            value={stats.equipment.active}
            subtitle="Operational status"
            icon={ComputerDesktopIcon}
            color="primary"
          />
          <StatCard
            title="Under Maintenance"
            value={stats.equipment.maintenance}
            subtitle="Scheduled maintenance"
            icon={WrenchScrewdriverIcon}
            color="accent"
          />
          <StatCard
            title="Critical Priority"
            value={stats.equipment.critical}
            subtitle="Requires attention"
            icon={ExclamationTriangleIcon}
            color="destructive"
          />
        </div>
      </div>

      {/* Support Requests Stats */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Support Requests</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Requests" value={stats.requests.total} icon={ExclamationTriangleIcon} />
          <StatCard
            title="Open Requests"
            value={stats.requests.open}
            subtitle="Awaiting resolution"
            icon={ExclamationTriangleIcon}
            color="primary"
          />
          <StatCard
            title="Critical Requests"
            value={stats.requests.critical}
            subtitle="Patient care impact"
            icon={ExclamationTriangleIcon}
            color="destructive"
          />
          <StatCard
            title="Overdue Requests"
            value={stats.requests.overdue}
            subtitle="Past SLA deadline"
            icon={ExclamationTriangleIcon}
            color="destructive"
          />
        </div>
      </div>

      {/* Tasks Stats */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Task Management</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Tasks" value={stats.tasks.total} icon={ClipboardDocumentListIcon} />
          <StatCard
            title="Pending Assignment"
            value={stats.tasks.pending}
            subtitle="Awaiting assignment"
            icon={ClipboardDocumentListIcon}
            color="accent"
          />
          <StatCard
            title="In Progress"
            value={stats.tasks.in_progress}
            subtitle="Currently active"
            icon={ClipboardDocumentListIcon}
            color="primary"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.tasks.overdue}
            subtitle="Past due date"
            icon={ClipboardDocumentListIcon}
            color="destructive"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Analytics & Trends</h2>
        <DashboardCharts analytics={analytics} loading={loading} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <AlertsPanel alerts={alerts} loading={loading} />
        <ActivityFeed activities={recentActivity} loading={loading} />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                Add New Equipment
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Create Support Request
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                Generate Report
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Emergency Response
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
