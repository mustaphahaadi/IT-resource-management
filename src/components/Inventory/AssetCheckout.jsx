import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { 
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../../services/api"

const AssetCheckout = ({ equipment, onClose, onSuccess }) => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [notes, setNotes] = useState("")
  const [condition, setCondition] = useState(equipment.condition || "good")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(true)

  const isCheckedOut = equipment.status === 'checked_out'

  useEffect(() => {
    fetchUsers()
    // Set default return date to 7 days from now
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    setExpectedReturnDate(defaultDate.toISOString().split('T')[0])
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiService.getUsers()
      setUsers(response.data.results || response.data || [])
    } catch (err) {
      setError("Failed to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleCheckOut = async () => {
    if (!selectedUser) {
      setError("Please select a user")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      await apiService.checkOutEquipment(equipment.id, {
        user_id: selectedUser,
        expected_return_date: expectedReturnDate,
        notes: notes
      })
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to check out equipment")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      setLoading(true)
      setError("")
      
      await apiService.checkInEquipment(equipment.id, {
        notes: notes,
        condition: condition
      })
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to check in equipment")
    } finally {
      setLoading(false)
    }
  }

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'excellent':
        return 'text-green-700 bg-green-100'
      case 'good':
        return 'text-blue-700 bg-blue-100'
      case 'fair':
        return 'text-yellow-700 bg-yellow-100'
      case 'poor':
        return 'text-orange-700 bg-orange-100'
      case 'damaged':
        return 'text-red-700 bg-red-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            {isCheckedOut ? (
              <ArrowLeftIcon className="w-6 h-6 text-green-600" />
            ) : (
              <ArrowRightIcon className="w-6 h-6 text-blue-600" />
            )}
            <div>
              <CardTitle>
                {isCheckedOut ? 'Check In Equipment' : 'Check Out Equipment'}
              </CardTitle>
              <p className="text-sm text-gray-600">{equipment.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Equipment Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Asset Tag:</span>
              <span className="text-sm text-gray-900">{equipment.asset_tag}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Current Status:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                equipment.status === 'checked_out' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {equipment.status.replace('_', ' ')}
              </span>
            </div>
            {isCheckedOut && equipment.checked_out_to_name && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Checked out to:</span>
                <span className="text-sm text-gray-900">{equipment.checked_out_to_name}</span>
              </div>
            )}
          </div>

          {!isCheckedOut ? (
            // Check Out Form
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Check out to user *
                </label>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">Loading users...</div>
                ) : (
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Expected return date
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            // Check In Form
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(condition)}`}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isCheckedOut ? "Any issues or observations..." : "Reason for checkout..."}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={isCheckedOut ? handleCheckIn : handleCheckOut}
              disabled={loading || (!isCheckedOut && !selectedUser)}
              className="flex-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : isCheckedOut ? (
                <CheckCircleIcon className="w-4 h-4 mr-2" />
              ) : (
                <ArrowRightIcon className="w-4 h-4 mr-2" />
              )}
              {isCheckedOut ? 'Check In' : 'Check Out'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssetCheckout
