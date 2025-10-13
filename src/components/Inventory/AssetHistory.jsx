import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { 
  ClockIcon,
  UserIcon,
  XMarkIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../../services/api"

const AssetHistory = ({ equipment, onClose }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchHistory()
  }, [equipment.id])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await apiService.getEquipmentHistory(equipment.id)
      setHistory(response.data)
    } catch (err) {
      setError("Failed to load equipment history")
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    const iconClass = "w-4 h-4"
    switch (action) {
      case 'created':
        return <div className={`${iconClass} bg-blue-500 rounded-full`}></div>
      case 'checked_out':
        return <ArrowRightIcon className={`${iconClass} text-orange-600`} />
      case 'checked_in':
        return <ArrowRightIcon className={`${iconClass} text-green-600 transform rotate-180`} />
      case 'assigned':
        return <UserIcon className={`${iconClass} text-blue-600`} />
      case 'maintenance_started':
        return <div className={`${iconClass} bg-yellow-500 rounded-full`}></div>
      case 'maintenance_completed':
        return <div className={`${iconClass} bg-green-500 rounded-full`}></div>
      case 'status_changed':
        return <div className={`${iconClass} bg-purple-500 rounded-full`}></div>
      case 'location_changed':
        return <div className={`${iconClass} bg-indigo-500 rounded-full`}></div>
      case 'retired':
        return <div className={`${iconClass} bg-gray-500 rounded-full`}></div>
      case 'disposed':
        return <div className={`${iconClass} bg-red-500 rounded-full`}></div>
      default:
        return <div className={`${iconClass} bg-gray-400 rounded-full`}></div>
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'created':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'checked_out':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'checked_in':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'assigned':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'maintenance_started':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'maintenance_completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'status_changed':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'location_changed':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      case 'retired':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'disposed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Asset History</CardTitle>
              <p className="text-sm text-gray-600">{equipment.name} ({equipment.asset_tag})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading history...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchHistory} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No history records found</p>
              </div>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {history.map((record) => (
                  <div key={record.id} className="relative flex items-start space-x-4 p-6 hover:bg-gray-50">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full">
                      {getActionIcon(record.action)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getActionColor(record.action)}`}>
                            {formatAction(record.action)}
                          </span>
                          {record.user_name && (
                            <span className="text-sm text-gray-600">
                              by {record.user_name}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(record.timestamp)}
                        </span>
                      </div>
                      
                      {(record.old_value || record.new_value) && (
                        <div className="mb-2">
                          {record.old_value && record.new_value ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {record.old_value}
                              </span>
                              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900 bg-blue-100 px-2 py-1 rounded">
                                {record.new_value}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-900 bg-blue-100 px-2 py-1 rounded">
                              {record.new_value || record.old_value}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {record.notes && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {record.notes}
                        </p>
                      )}
                      
                      {record.ip_address && (
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {record.ip_address}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AssetHistory
