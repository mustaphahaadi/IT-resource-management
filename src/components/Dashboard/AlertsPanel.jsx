import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

const AlertsPanel = ({ alerts = [], loading = false }) => {
  const getAlertIcon = (severity) => {
    const icons = {
      critical: ExclamationTriangleIcon,
      warning: ExclamationCircleIcon,
      info: InformationCircleIcon,
    }
    return icons[severity] || InformationCircleIcon
  }

  const getAlertColor = (severity) => {
    const colors = {
      critical: "text-red-600 bg-red-50 border-red-200",
      warning: "text-orange-600 bg-orange-50 border-orange-200",
      info: "text-blue-600 bg-blue-50 border-blue-200",
    }
    return colors[severity] || "text-gray-600 bg-gray-50 border-gray-200"
  }

  const sampleAlerts = [
    {
      id: 1,
      severity: "critical",
      title: "Equipment Failure",
      message: "MRI Scanner in Room 204 is offline",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      department: "Radiology",
    },
    {
      id: 2,
      severity: "warning",
      title: "Maintenance Due",
      message: "Server Room UPS requires maintenance within 24 hours",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      department: "IT Infrastructure",
    },
    {
      id: 3,
      severity: "critical",
      title: "Network Issue",
      message: "Emergency Department network experiencing intermittent connectivity",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      department: "Emergency",
    },
    {
      id: 4,
      severity: "info",
      title: "System Update",
      message: "Scheduled system maintenance completed successfully",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      department: "IT Operations",
    },
    {
      id: 5,
      severity: "warning",
      title: "License Expiry",
      message: "Software licenses for Imaging Suite expire in 7 days",
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      department: "Radiology",
    },
  ]

  const displayAlerts = alerts.length > 0 ? alerts : sampleAlerts

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - new Date(timestamp)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const handleDismissAlert = (alertId) => {
    console.log("Dismissing alert:", alertId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Active Alerts
          <span className="text-sm font-normal text-muted-foreground">
            {displayAlerts.filter((a) => a.severity === "critical").length} critical
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displayAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.severity)
              return (
                <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs mt-1">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">{alert.department}</span>
                          <span className="text-xs opacity-75">{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDismissAlert(alert.id)} className="ml-2 opacity-50 hover:opacity-100">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AlertsPanel
