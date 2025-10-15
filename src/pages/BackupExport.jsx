import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Alert, AlertDescription } from '../components/ui/alert'
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ServerIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const BackupExport = () => {
  const { user, hasPermission } = useAuth()
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [exporting, setExporting] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedData, setSelectedData] = useState({
    equipment: true,
    requests: true,
    tasks: true,
    users: false,
    reports: true,
    settings: false
  })
  const [exportFormat, setExportFormat] = useState('csv')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBackupHistory()
      setBackups(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error fetching backups:', error)
      setBackups([])
      setError('Failed to load backup history.')
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    if (!hasPermission('create_backup')) {
      setError('You do not have permission to create backups')
      return
    }

    setCreating(true)
    setError('')
    setMessage('')

    try {
      const response = await apiService.createBackup()
      setMessage('Backup created successfully!')
      fetchBackups()
    } catch (error) {
      setError('Failed to create backup. Please try again.')
      console.error('Backup creation error:', error)
    } finally {
      setCreating(false)
    }
  }

  const downloadBackup = async (backupId, filename) => {
    try {
      const response = await apiService.downloadBackup(backupId)
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
      link.setAttribute('download', sanitizedFilename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to download backup')
      console.error('Download error:', error)
    }
  }

  const deleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return
    }

    try {
      await apiService.delete(`/admin/backup/${backupId}/`)
      setMessage('Backup deleted successfully')
      fetchBackups()
    } catch (error) {
      setError('Failed to delete backup')
      console.error('Delete error:', error)
    }
  }

  const exportData = async (format) => {
    setExporting({ ...exporting, [format]: true })
    setError('')
    setMessage('')

    try {
      const exportData = {
        format,
        data_types: Object.keys(selectedData).filter(key => selectedData[key]),
        date_range: dateRange
      }

      const response = await apiService.post('/admin/export/', exportData, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const sanitizedFormat = format.replace(/[^a-z0-9]/gi, '')
      const filename = `it_resource_export_${sanitizedFormat}_${new Date().toISOString().split('T')[0]}.${sanitizedFormat}`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setMessage(`Data exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      setError(`Failed to export data as ${format.toUpperCase()}`)
      console.error('Export error:', error)
    } finally {
      setExporting({ ...exporting, [format]: false })
    }
  }

  const handleDataTypeChange = (type) => {
    setSelectedData(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const getBackupStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getBackupTypeIcon = (type) => {
    return type === 'full' ? (
      <CircleStackIcon className="w-4 h-4 text-blue-600" />
    ) : (
      <ServerIcon className="w-4 h-4 text-green-600" />
    )
  }

  const formatFileSize = (size) => {
    if (typeof size === 'string') return size
    const units = ['B', 'KB', 'MB', 'GB']
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (!hasPermission('view_backups') && !hasPermission('export_data')) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You do not have permission to access backup and export features.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Export</h1>
          <p className="text-gray-600 mt-1">Manage system backups and export data</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchBackups} variant="outline" disabled={loading}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {hasPermission('create_backup') && (
            <Button onClick={createBackup} disabled={creating}>
              {creating ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert>
          <CheckCircleIcon className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Export */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
                <span>Data Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Data to Export</h3>
                <div className="space-y-2">
                  {Object.entries({
                    equipment: 'Equipment Inventory',
                    requests: 'Support Requests',
                    tasks: 'Tasks & Workflows',
                    users: 'User Data',
                    reports: 'Generated Reports',
                    settings: 'System Settings'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedData[key]}
                        onChange={() => handleDataTypeChange(key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={key === 'users' && !hasPermission('export_users')}
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                      {key === 'users' && !hasPermission('export_users') && (
                        <span className="text-xs text-gray-500">(Restricted)</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Date Range</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Export Format</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => exportData('csv')}
                    disabled={exporting.csv || Object.values(selectedData).every(v => !v)}
                    variant="outline"
                    className="flex flex-col items-center py-4"
                  >
                    {exporting.csv ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin mb-1" />
                    ) : (
                      <DocumentArrowDownIcon className="w-5 h-5 mb-1" />
                    )}
                    <span className="text-xs">CSV</span>
                  </Button>
                  <Button
                    onClick={() => exportData('json')}
                    disabled={exporting.json || Object.values(selectedData).every(v => !v)}
                    variant="outline"
                    className="flex flex-col items-center py-4"
                  >
                    {exporting.json ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin mb-1" />
                    ) : (
                      <DocumentArrowDownIcon className="w-5 h-5 mb-1" />
                    )}
                    <span className="text-xs">JSON</span>
                  </Button>
                  <Button
                    onClick={() => exportData('xlsx')}
                    disabled={exporting.xlsx || Object.values(selectedData).every(v => !v)}
                    variant="outline"
                    className="flex flex-col items-center py-4"
                  >
                    {exporting.xlsx ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin mb-1" />
                    ) : (
                      <DocumentArrowDownIcon className="w-5 h-5 mb-1" />
                    )}
                    <span className="text-xs">Excel</span>
                  </Button>
                </div>
              </div>

              <Alert>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Exported data will include only the selected data types within the specified date range. 
                  Sensitive information is automatically filtered based on your permissions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* System Backups */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudArrowUpIcon className="w-6 h-6 text-green-600" />
                <span>System Backups</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSpinner text="Loading backups..." />
              ) : backups.length === 0 ? (
                <div className="text-center py-8">
                  <CircleStackIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No backups found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div key={backup.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getBackupTypeIcon(backup.type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{backup.filename}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{formatFileSize(backup.size)}</span>
                              <span>{new Date(backup.created_at).toLocaleDateString()}</span>
                              <span className="capitalize">{backup.type}</span>
                            </div>
                            <p className="text-xs text-gray-500">Created by {backup.created_by}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBackupStatusColor(backup.status)}`}>
                            {backup.status}
                          </span>
                          {backup.status === 'completed' && (
                            <div className="flex space-x-1">
                              <Button
                                onClick={() => downloadBackup(backup.id, backup.filename)}
                                size="sm"
                                variant="outline"
                              >
                                <CloudArrowDownIcon className="w-4 h-4" />
                              </Button>
                              {hasPermission('delete_backup') && (
                                <Button
                                  onClick={() => deleteBackup(backup.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="w-6 h-6 text-purple-600" />
                <span>Backup Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Full Backup</span>
                  <span className="text-sm font-medium text-gray-900">Daily at 2:00 AM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Incremental Backup</span>
                  <span className="text-sm font-medium text-gray-900">Every 6 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Retention Period</span>
                  <span className="text-sm font-medium text-gray-900">30 days</span>
                </div>
              </div>
              
              <Alert className="mt-4">
                <InformationCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Backups are automatically created according to the schedule above. 
                  Manual backups can be created at any time by authorized users.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BackupExport
