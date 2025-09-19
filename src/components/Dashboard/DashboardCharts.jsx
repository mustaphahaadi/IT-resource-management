import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const DashboardCharts = ({ analytics = {}, loading }) => {
  const a = analytics || {}
  const equipmentTrendData = Array.isArray(a.equipmentTrends)
    ? a.equipmentTrends
    : Array.isArray(a.equipment_trends)
    ? a.equipment_trends
    : []

  const requestVolumeData = Array.isArray(a.requestTrends)
    ? a.requestTrends
    : Array.isArray(a.request_trends)
    ? a.request_trends
    : []

  const departmentRaw = Array.isArray(a.departmentStats)
    ? a.departmentStats
    : Array.isArray(a.department_stats)
    ? a.department_stats
    : []
  const departmentData = departmentRaw.map((d) => ({
    name: d.department,
    value: d.requests,
  }))

  const perf = a.performanceMetrics || a.performance_metrics || {}
  const responseTimeData = [{
    label: "Overall",
    avgTime: perf?.avg_resolution_time || 0,
    target: 8, // Target hours (example SLO)
  }]

  const taskTrendData = Array.isArray(a.taskTrends)
    ? a.taskTrends
    : Array.isArray(a.task_trends)
    ? a.task_trends
    : []

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Equipment Status Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Status Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equipmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="active" name="Active" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="maintenance" name="Maintenance" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Request Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Request Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="created" fill="#3b82f6" name="Created" />
              <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Task Creation vs Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="created" fill="#6366f1" name="Created" />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Requests by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"][index % 6]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Response Time Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time vs Target</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgTime" fill="#3b82f6" name="Actual (hours)" />
              <Bar dataKey="target" fill="#e5e7eb" name="Target (hours)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCharts
