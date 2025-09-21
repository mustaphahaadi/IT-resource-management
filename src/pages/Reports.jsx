
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CalendarIcon,
  FunnelIcon,
  PrinterIcon,
  ShareIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../services/api"

const Reports = () => {
  const [analytics, setAnalytics] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState("overview")

  useEffect(() => {
    fetchReportsData()
  }, [dateRange, reportType])

  const fetchReportsData = async () => {
    setLoading(true)
    setError("")
    try {
      // Fetch request analytics (overview) + dashboard analytics for system-level metrics
      const [reqAnalyticsRes, dashboardRes, requestsRes] = await Promise.all([
        apiService.getRequestAnalytics({
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          report_type: reportType
        }),
        apiService.getDashboardAnalytics(),
        apiService.getSupportRequests({
          limit: 10,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        })
      ])
      const reqData = reqAnalyticsRes.data || {}
      const dashData = dashboardRes.data || {}
      const overview = reqData.overview || {}
      const perf = dashData.performance_metrics || {}
      const equipment = dashData.equipment || {}

      // Normalize to fields this page renders
      setAnalytics({
        totalEquipment: equipment.total || 0,
        activeEquipment: equipment.active || 0,
        totalRequests: overview.total_requests || 0,
        resolvedRequests: overview.resolved_requests || 0,
        avgResponseTime: perf.avg_resolution_time || 0,
        systemUptime: perf.system_uptime || 0,
        departmentBreakdown: dashData.department_stats || [],
      })
      setRequests(requestsRes.data.results || requestsRes.data || [])
    } catch (err) {
      setError("Failed to load reports data.")
      console.error('Error fetching reports data:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type) => {
    try {
      setLoading(true)
      const response = await apiService.generateReport(type, {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        report_type: reportType
      })
      
      if (response.data.download_url) {
        // Open download link
        window.open(response.data.download_url, '_blank')
      } else {
        alert('Report generated successfully! Check your email for the download link.')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format) => {
    try {
      setLoading(true)
      const response = await apiService.generateReport('export', {
        format,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        report_type: reportType
      })
      
      if (response.data.download_url) {
        // Create download link
        const link = document.createElement('a')
        link.href = response.data.download_url
        link.download = `hospital_it_report_${format}_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate reports and view system analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchReportsData} disabled={loading} variant="outline">
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button onClick={() => generateReport('comprehensive')}>
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Report Controls */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-blue-600" />
            <span>Report Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overview">System Overview</option>
                <option value="equipment">Equipment Report</option>
                <option value="requests">Support Requests</option>
                <option value="performance">Performance Metrics</option>
                <option value="department">Department Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={() => generateReport('pdf')} variant="outline" size="sm">
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => exportData('csv')} variant="outline" size="sm">
              <ShareIcon className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => window.print()} variant="outline" size="sm">
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalEquipment}</p>
                  <p className="text-xs text-green-600">
                    {analytics.activeEquipment} active ({analytics.totalEquipment > 0 ? ((analytics.activeEquipment / analytics.totalEquipment) * 100).toFixed(1) : '0.0'}%)
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Support Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalRequests}</p>
                  <p className="text-xs text-green-600">
                    {analytics.resolvedRequests} resolved ({analytics.totalRequests > 0 ? ((analytics.resolvedRequests / analytics.totalRequests) * 100).toFixed(1) : '0.0'}%)
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgResponseTime}h</p>
                  <p className="text-xs text-blue-600">Within SLA targets</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.systemUptime}%</p>
                  <p className="text-xs text-green-600">Excellent performance</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Breakdown */}
      {analytics && analytics.departmentBreakdown && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Requests</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Request Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.departmentBreakdown.map((dept, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                      <td className="py-3 px-4 text-gray-700">{dept.equipment}</td>
                      <td className="py-3 px-4 text-gray-700">{dept.requests}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {dept.equipment > 0 ? ((dept.requests / dept.equipment) * 100).toFixed(1) : '0.0'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Requests */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Recent Support Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{req.ticket_number}</td>
                      <td className="py-3 px-4 text-gray-900">{req.title}</td>
                      <td className="py-3 px-4 text-gray-700">{req.requester_department}</td>
                      <td className="py-3 px-4 text-gray-700">{req.category_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          req.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          req.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          req.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          req.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports
