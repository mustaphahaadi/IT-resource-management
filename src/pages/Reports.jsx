
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CalendarIcon,
  FunnelIcon,
  PrinterIcon,
  ShareIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import PageHeader from "../components/common/PageHeader";
import AsyncSelect from '../components/ui/AsyncSelect'
import { Input } from "../components/ui/input";
import DataTable from "../components/ui/data-table";
import { apiService } from "../services/api"

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState("overview");

  useEffect(() => {
    fetchReportsData();
  }, [dateRange, reportType]);

  const fetchReportsData = async () => {
    setLoading(true);
    setError("");
    try {
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
      ]);
      const reqData = reqAnalyticsRes.data || {};
      const dashData = dashboardRes.data || {};
      const overview = reqData.overview || {};
      const perf = dashData.performance_metrics || {};
      const equipment = dashData.equipment || {};

      setAnalytics({
        totalEquipment: equipment.total || 0,
        activeEquipment: equipment.active || 0,
        totalRequests: overview.total_requests || 0,
        resolvedRequests: overview.resolved_requests || 0,
        avgResponseTime: perf.avg_resolution_time || 0,
        systemUptime: perf.system_uptime || 0,
        departmentBreakdown: dashData.department_stats || [],
      });
      setRequests(requestsRes.data.results || requestsRes.data || []);
    } catch (err) {
      setError("Failed to load reports data.");
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.generateReport(type, {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        report_type: reportType
      });
      
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank');
      } else if (response.data.message) {
        setError(response.data.message);
      } else {
        setError('Report generated successfully! Check your email for the download link.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to generate report. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.generateReport('export', {
        format,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        report_type: reportType
      });
      
      if (response.data.download_url) {
        const link = document.createElement('a');
        link.href = response.data.download_url;
        const sanitizedFormat = format.replace(/[^a-z0-9]/gi, '');
        link.setAttribute('download', `it_resource_report_${sanitizedFormat}_${new Date().toISOString().split('T')[0]}.${sanitizedFormat}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(response.data.message || 'Export initiated. Check your email.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to export data. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const departmentColumns = [
    { key: 'department', title: 'Department', sortable: true },
    { key: 'equipment', title: 'Equipment', sortable: true },
    { key: 'requests', title: 'Requests', sortable: true },
    {
      key: 'request_rate',
      title: 'Request Rate',
      sortable: true,
      render: (_, row) => (
        <span>{row.equipment > 0 ? ((row.requests / row.equipment) * 100).toFixed(1) : '0.0'}%</span>
      )
    }
  ];

  const requestColumns = [
    { key: 'ticket_number', title: 'Ticket #', sortable: true },
    { key: 'title', title: 'Title', sortable: true },
    { key: 'requester_department', title: 'Department', sortable: true },
    { key: 'category_name', title: 'Category', sortable: true },
    { key: 'priority', title: 'Priority', sortable: true, type: 'status', statusType: 'priority' },
    { key: 'status', title: 'Status', sortable: true, type: 'status', statusType: 'request' },
    { key: 'created_at', title: 'Created', sortable: true, type: 'datetime' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports & Analytics"
        description="Generate reports and view system analytics"
        actions={[
          <Button key="refresh" onClick={fetchReportsData} disabled={loading} variant="outline">
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>,
          <Button key="generate" onClick={() => generateReport('comprehensive')}>
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        ]}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <AsyncSelect
              options={[
                { value: 'overview', label: 'System Overview' },
                { value: 'equipment', label: 'Equipment Report' },
                { value: 'requests', label: 'Support Requests' },
                { value: 'performance', label: 'Performance Metrics' },
                { value: 'department', label: 'Department Analysis' }
              ]}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2"
            />
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          <div className="flex flex-wrap gap-2">
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

      {analytics && analytics.departmentBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={analytics.departmentBreakdown}
              columns={departmentColumns}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Support Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests}
            columns={requestColumns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports
