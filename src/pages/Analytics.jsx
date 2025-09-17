import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { apiService } from "../services/api"
import DashboardCharts from "../components/Dashboard/DashboardCharts"

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await apiService.get("/analytics/dashboard/")
      setAnalytics(response.data)
    } catch (err) {
      setError("Failed to load analytics data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
        <p className="text-muted-foreground">Deep dive into system metrics and trends</p>
      </div>
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardCharts analytics={analytics || {}} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics
