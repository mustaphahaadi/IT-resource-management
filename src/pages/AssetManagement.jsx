import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"
import { usePermissions, PermissionGate } from "../contexts/PermissionsContext"
import { apiService } from "../services/api"
import AssetScanner from "../components/Inventory/AssetScanner"

const AssetManagement = () => {
  const [stats, setStats] = useState({
    total_audits: 0,
    pending_audits: 0,
    overdue_checkouts: 0,
    active_alerts: 0,
    recent_activities: 0
  })
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [recentAudits, setRecentAudits] = useState([])
  const [overdueCheckouts, setOverdueCheckouts] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const { hasPermission } = usePermissions()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch asset management statistics
      const [auditsResponse, checkoutsResponse, alertsResponse] = await Promise.all([
        apiService.getAssetAudits({ limit: 5 }),
        apiService.getOverdueCheckouts(),
        apiService.getAssetAlerts({ is_active: true, limit: 10 })
      ])

      setRecentAudits(auditsResponse.data.results || auditsResponse.data || [])
      setOverdueCheckouts(checkoutsResponse.data.results || checkoutsResponse.data || [])
      setActiveAlerts(alertsResponse.data.results || alertsResponse.data || [])

      setStats({
        total_audits: recentAudits.length,
        pending_audits: recentAudits.filter(audit => audit.status === 'planned').length,
        overdue_checkouts: overdueCheckouts.length,
        active_alerts: activeAlerts.length,
        recent_activities: recentAudits.length + overdueCheckouts.length + activeAlerts.length
      })
    } catch (error) {
      console.error('Failed to fetch asset management data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScanSuccess = (equipment) => {
    setShowScanner(false)
  }

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-800 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-800 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-yellow-800 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-blue-800 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200'
    }
  }

  const getAuditStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100'
      case 'in_progress':
        return 'text-blue-800 bg-blue-100'
      case 'planned':
        return 'text-yellow-800 bg-yellow-100'
      case 'cancelled':
        return 'text-red-800 bg-red-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading asset management data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600 mt-1">Advanced asset tracking, audits, and monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowScanner(true)} variant="outline" className="flex items-center space-x-2">
            <QrCodeIcon className="w-4 h-4" />
            <span>Scan Asset</span>
          </Button>
          <Button onClick={fetchData} variant="outline" className="flex items-center space-x-2">
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Audits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_audits}</p>
              </div>
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Audits</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_audits}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Checkouts</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue_checkouts}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.active_alerts}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
              <span>Recent Audits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAudits.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent audits</p>
            ) : (
              <div className="space-y-3">
                {recentAudits.slice(0, 5).map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{audit.name}</p>
                      <p className="text-sm text-gray-600">{audit.audit_type} • {audit.scheduled_date}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAuditStatusColor(audit.status)}`}>
                      {audit.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Active Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            ) : (
              <div className="space-y-3">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAlertSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{alert.equipment_name} • {alert.alert_type}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Checkouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>Overdue Checkouts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueCheckouts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No overdue checkouts</p>
            ) : (
              <div className="space-y-3">
                {overdueCheckouts.slice(0, 5).map((checkout) => (
                  <div key={checkout.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{checkout.equipment_name}</p>
                      <span className="text-xs text-red-600 font-medium">
                        Overdue
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Checked out to: {checkout.checked_out_to_name}
                    </p>
                    <p className="text-sm text-red-600">
                      Expected return: {new Date(checkout.expected_return_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <PermissionGate permissions="equipment.audit">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                  Create New Audit
                </Button>
              </PermissionGate>
              
              <Button className="w-full justify-start" variant="outline">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                View All Alerts
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <ClockIcon className="w-4 h-4 mr-2" />
                Checkout History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Scanner Modal */}
      {showScanner && (
        <AssetScanner onClose={() => setShowScanner(false)} onScanSuccess={handleScanSuccess} />
      )}
    </div>
  )
}

export default AssetManagement
