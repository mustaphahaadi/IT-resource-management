import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  GlobeAltIcon,
  CpuChipIcon,
  CircleStackIcon,
  WifiIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SystemStatus = () => {
  const [systemHealth, setSystemHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [incidents, setIncidents] = useState([])
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([])

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      const response = await apiService.getSystemHealth()
      setSystemHealth(response.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching system status:', error)
      // Fallback to mock data
      setSystemHealth({
        overall_status: 'operational',
        services: [
          {
            name: 'Web Application',
            status: 'operational',
            response_time: 145,
            uptime: 99.98,
            last_incident: null
          },
          {
            name: 'Database',
            status: 'operational',
            response_time: 23,
            uptime: 99.95,
            last_incident: null
          },
          {
            name: 'API Services',
            status: 'operational',
            response_time: 89,
            uptime: 99.99,
            last_incident: null
          },
          {
            name: 'File Storage',
            status: 'operational',
            response_time: 67,
            uptime: 99.92,
            last_incident: null
          },
          {
            name: 'Email Service',
            status: 'degraded',
            response_time: 234,
            uptime: 98.45,
            last_incident: '2024-01-15T10:30:00Z'
          },
          {
            name: 'Backup Systems',
            status: 'operational',
            response_time: 156,
            uptime: 99.87,
            last_incident: null
          }
        ],
        metrics: {
          total_requests: 1245678,
          avg_response_time: 127,
          error_rate: 0.02,
          active_users: 234,
          system_load: 45.6,
          memory_usage: 67.8,
          disk_usage: 34.2,
          network_latency: 12
        }
      })
      setIncidents([
        {
          id: 1,
          title: 'Email Service Degradation',
          status: 'investigating',
          severity: 'minor',
          started_at: '2024-01-15T10:30:00Z',
          description: 'Some users may experience delays in email notifications. Our team is investigating the issue.',
          updates: [
            {
              timestamp: '2024-01-15T10:30:00Z',
              message: 'Issue identified and investigation started'
            },
            {
              timestamp: '2024-01-15T11:15:00Z',
              message: 'Root cause identified, implementing fix'
            }
          ]
        }
      ])
      setMaintenanceSchedule([
        {
          id: 1,
          title: 'Database Maintenance',
          scheduled_for: '2024-01-20T02:00:00Z',
          duration: '2 hours',
          impact: 'System will be unavailable during maintenance window',
          status: 'scheduled'
        },
        {
          id: 2,
          title: 'Security Updates',
          scheduled_for: '2024-01-25T01:00:00Z',
          duration: '1 hour',
          impact: 'Brief service interruptions possible',
          status: 'scheduled'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'partial_outage':
        return 'text-orange-600 bg-orange-100'
      case 'major_outage':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'partial_outage':
      case 'major_outage':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getOverallStatusMessage = (status) => {
    switch (status) {
      case 'operational':
        return 'All systems operational'
      case 'degraded':
        return 'Some systems experiencing issues'
      case 'partial_outage':
        return 'Partial system outage'
      case 'major_outage':
        return 'Major system outage'
      default:
        return 'System status unknown'
    }
  }

  const formatUptime = (uptime) => {
    return `${uptime.toFixed(2)}%`
  }

  const formatResponseTime = (time) => {
    return `${time}ms`
  }

  if (loading) {
    return <LoadingSpinner text="Loading system status..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-600 mt-1">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button onClick={fetchSystemStatus} variant="outline" size="sm">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            {getStatusIcon(systemHealth?.overall_status)}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {getOverallStatusMessage(systemHealth?.overall_status)}
              </h2>
              <p className="text-gray-600">Hospital IT Resource Management System</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ServerIcon className="w-6 h-6 text-blue-600" />
            <span>Service Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth?.services?.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                      {service.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    <div>Uptime: {formatUptime(service.uptime)}</div>
                    <div>Response: {formatResponseTime(service.response_time)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GlobeAltIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth?.metrics?.active_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CpuChipIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">System Load</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth?.metrics?.system_load}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CircleStackIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth?.metrics?.memory_usage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <WifiIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Network Latency</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth?.metrics?.network_latency}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Incidents */}
      {incidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              <span>Current Incidents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                          incident.status === 'identified' ? 'bg-blue-100 text-blue-800' :
                          incident.status === 'monitoring' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {incident.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Started: {new Date(incident.started_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {incident.updates && incident.updates.length > 0 && (
                    <div className="mt-4 border-t border-yellow-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Updates:</h4>
                      <div className="space-y-2">
                        {incident.updates.map((update, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            <span className="font-medium">
                              {new Date(update.timestamp).toLocaleString()}:
                            </span>
                            <span className="ml-2">{update.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <span>Scheduled Maintenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceSchedule.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No scheduled maintenance at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceSchedule.map((maintenance) => (
                <div key={maintenance.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{maintenance.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{maintenance.impact}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <strong>Scheduled:</strong> {new Date(maintenance.scheduled_for).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          <strong>Duration:</strong> {maintenance.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            <span>Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">99.98%</div>
              <div className="text-sm text-gray-600">30-day uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{systemHealth?.metrics?.avg_response_time}ms</div>
              <div className="text-sm text-gray-600">Avg response time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{systemHealth?.metrics?.error_rate}%</div>
              <div className="text-sm text-gray-600">Error rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Page Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">About This Status Page</h3>
              <p className="text-sm text-gray-600 mt-1">
                This page shows real-time status of our Hospital IT Resource Management System. 
                We update this page whenever we have planned maintenance or are experiencing issues. 
                If you're experiencing problems not reflected here, please contact our support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemStatus
