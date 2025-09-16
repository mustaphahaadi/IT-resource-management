"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import {
  XMarkIcon,
  BellIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline"
import { apiService } from "../../services/api"

const AlertsPanel = ({ alerts, onClose, onUpdate }) => {
  const handleAcknowledge = async (alertId) => {
    try {
      await apiService.acknowledgeAlert(alertId)
      onUpdate()
    } catch (error) {
      console.error("Error acknowledging alert:", error)
    }
  }

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case "equipment_down":
        return <ComputerDesktopIcon className="w-5 h-5 text-destructive" />
      case "maintenance_due":
        return <WrenchScrewdriverIcon className="w-5 h-5 text-orange-600" />
      case "warranty_expiry":
        return <ClockIcon className="w-5 h-5 text-orange-600" />
      case "license_expiry":
        return <ClockIcon className="w-5 h-5 text-orange-600" />
      case "sla_breach":
        return <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
      case "critical_request":
        return <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
      default:
        return <BellIcon className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case "equipment_down":
      case "sla_breach":
      case "critical_request":
        return "border-destructive/30 bg-destructive/5"
      case "maintenance_due":
      case "warranty_expiry":
      case "license_expiry":
        return "border-orange-200 bg-orange-50"
      default:
        return "border-border"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BellIcon className="w-5 h-5" />
            <span>System Alerts ({alerts.length})</span>
          </CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.alert_type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.alert_type)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{alert.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{alert.message}</p>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{alert.get_alert_type_display || alert.alert_type.replace("_", " ")}</span>
                          <span>{new Date(alert.created_at).toLocaleString()}</span>
                          {alert.request_ticket && <span>Ticket: {alert.request_ticket}</span>}
                          {alert.equipment_name && <span>Equipment: {alert.equipment_name}</span>}
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AlertsPanel
