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

const DashboardCharts = ({ analytics, loading }) => {
  // Sample data for demonstration - replace with real analytics data
  const equipmentTrendData = [
    { month: "Jan", active, maintenance, critical: 3 },
    { month: "Feb", active, maintenance, critical: 2 },
    { month: "Mar", active, maintenance, critical: 5 },
    { month: "Apr", active, maintenance, critical: 1 },
    { month: "May", active, maintenance, critical: 4 },
    { month: "Jun", active, maintenance, critical: 2 },
  ]

  const requestVolumeData = [
    { day: "Mon", requests, resolved: 18 },
    { day: "Tue", requests, resolved: 25 },
    { day: "Wed", requests, resolved: 22 },
    { day: "Thu", requests, resolved: 30 },
    { day: "Fri", requests, resolved: 38 },
    { day: "Sat", requests, resolved: 12 },
    { day: "Sun", requests, resolved: 7 },
  ]

  const departmentData = [
    { name: "Emergency", value, color: "#ef4444" },
    { name: "ICU", value, color: "#f97316" },
    { name: "Surgery", value, color: "#eab308" },
    { name: "Radiology", value, color: "#22c55e" },
    { name: "Laboratory", value, color: "#3b82f6" },
    { name: "Other", value, color: "#8b5cf6" },
  ]

  const responseTimeData = [
    { priority: "Critical", avgTime: 0.5, target: 1 },
    { priority: "High", avgTime: 2.3, target: 4 },
    { priority: "Medium", avgTime: 8.7, target: 12 },
    { priority: "Low", avgTime: 18.2, target: 24 },
  ]

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
        )))
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
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="active" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area
                type="monotone"
                dataKey="maintenance"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
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
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#3b82f6" name="New Requests" />
              <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
              <YAxis dataKey="priority" type="category" />
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

    </div>
    </div>
    </div>
  )
}
export default DashboardCharts
