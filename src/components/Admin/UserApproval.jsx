import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { usePermissions, getRoleDisplayName, getRoleColor } from '../../contexts/PermissionsContext'
import { apiService } from '../../services/api'
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const UserApproval = () => {
  const { hasPermission } = usePermissions()
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (hasPermission('users.approve')) {
      fetchPendingUsers()
    }
  }, [])

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/auth/users/pending-approval/')
      setPendingUsers(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching pending users:', error)
      setError('Failed to load pending users')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId) => {
    setProcessing(prev => ({ ...prev, [userId]: 'approving' }))
    setError('')
    setSuccess('')

    try {
      await apiService.post(`/auth/users/${userId}/approve/`)
      setSuccess('User approved successfully')
      fetchPendingUsers()
    } catch (error) {
      console.error('Error approving user:', error)
      setError(error.response?.data?.message || 'Failed to approve user')
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: null }))
    }
  }

  const handleRejectUser = async (userId, reason = '') => {
    if (!window.confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return
    }

    setProcessing(prev => ({ ...prev, [userId]: 'rejecting' }))
    setError('')
    setSuccess('')

    try {
      await apiService.post(`/auth/users/${userId}/reject/`, { reason })
      setSuccess('User rejected successfully')
      fetchPendingUsers()
    } catch (error) {
      console.error('Error rejecting user:', error)
      setError(error.response?.data?.message || 'Failed to reject user')
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: null }))
    }
  }

  const handleBulkApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve all ${pendingUsers.length} pending users?`)) {
      return
    }

    setProcessing(prev => ({ ...prev, bulk: 'approving' }))
    setError('')
    setSuccess('')

    try {
      await apiService.post('/auth/users/bulk-approve/', {
        user_ids: pendingUsers.map(user => user.id)
      })
      setSuccess(`Successfully approved ${pendingUsers.length} users`)
      fetchPendingUsers()
    } catch (error) {
      console.error('Error bulk approving users:', error)
      setError(error.response?.data?.message || 'Failed to approve users')
    } finally {
      setProcessing(prev => ({ ...prev, bulk: null }))
    }
  }

  const getRoleBadgeColor = (role) => {
    const color = getRoleColor(role)
    return `bg-${color}-100 text-${color}-800 border-${color}-200`
  }

  const getDepartmentIcon = (department) => {
    const icons = {
      'it': '💻',
      'administration': '🏢',
      'human_resources': '👥',
      'finance': '💰',
      'operations': '⚙️',
      'marketing': '📢',
      'sales': '📈',
      'customer_service': '🎧',
      'legal': '⚖️',
      'facilities': '🏗️'
    }
    return icons[department] || '📋'
  }

  if (!hasPermission('users.approve')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to approve users.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Approval Center</h1>
          <p className="text-gray-600">Review and approve new user registrations for the IT support system</p>
        </div>
        {pendingUsers.length > 0 && (
          <Button
            onClick={handleBulkApprove}
            disabled={processing.bulk}
            className="bg-green-600 hover:bg-green-700"
          >
            {processing.bulk ? 'Approving...' : `Approve All (${pendingUsers.length})`}
          </Button>
        )}
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserGroupIcon className="w-5 h-5" />
            <span>Pending User Approvals</span>
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {pendingUsers.length} pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-gray-600">Loading pending users...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No users are currently pending approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-orange-400">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-sm text-gray-900">{user.email}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{getDepartmentIcon(user.department)}</span>
                              <p className="text-sm text-gray-900 capitalize">
                                {user.department?.replace('_', ' ') || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                            <p className="text-sm text-gray-900">{user.phone_number || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee ID</label>
                            <p className="text-sm text-gray-900">{user.employee_id || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500">REQUESTED ROLE:</span>
                            <Badge className={getRoleBadgeColor(user.role || 'end_user')}>
                              {getRoleDisplayName(user.role || 'end_user')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>Registered {new Date(user.date_joined).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {user.business_justification && (
                          <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Justification</label>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
                              {user.business_justification}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-6">
                        <Button
                          onClick={() => handleApproveUser(user.id)}
                          disabled={processing[user.id]}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processing[user.id] === 'approving' ? (
                            <>
                              <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleRejectUser(user.id)}
                          disabled={processing[user.id]}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {processing[user.id] === 'rejecting' ? (
                            <>
                              <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pendingUsers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Approval Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Verify that the user's email domain matches your organization</li>
                  <li>• Ensure the requested role is appropriate for their department</li>
                  <li>• Check that employee ID matches your HR records (if provided)</li>
                  <li>• Review business justification for elevated roles</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UserApproval
