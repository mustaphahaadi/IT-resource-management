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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#2F327D] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-white/90">Deep dive into system metrics and trends</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader className="bg-white border-b border-gray-200">
            <CardTitle className="text-[#2F327D]">Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
            <DashboardCharts analytics={analytics || {}} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics
