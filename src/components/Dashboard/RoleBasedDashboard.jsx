import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import StatusBadge from '../ui/status-badge'
import { usePermissions, PermissionGate } from '../../contexts/PermissionsContext'
import { apiService } from '../../services/api'
import {
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

const RoleBasedDashboard = () => {
  const navigate = useNavigate()
  const { userRole, user, hasPermission } = usePermissions()
  const [stats, setStats] = useState({})
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [userRole])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch role-specific data using real API endpoints
      const promises = []
      const apiCalls = []
      
      // Fetch request statistics
      if (hasPermission('requests.view_own') || hasPermission('requests.view_all')) {
        promises.push(apiService.getRequestStats())
        apiCalls.push('requestStats')
        
        // Also fetch recent requests for activity
        promises.push(apiService.getSupportRequests({ limit: 5, ordering: '-created_at' }))
        apiCalls.push('recentRequests')
      }
      
      // Fetch equipment statistics
      if (hasPermission('equipment.view_basic')) {
        promises.push(apiService.getEquipmentStats())
        apiCalls.push('equipmentStats')
      }
      
      // Fetch task statistics
      if (hasPermission('tasks.view_assigned') || hasPermission('tasks.view_all')) {
        promises.push(apiService.getTaskStats())
        apiCalls.push('taskStats')
        
        // Also fetch recent tasks for activity
        promises.push(apiService.getTasks({ limit: 5, ordering: '-created_at' }))
        apiCalls.push('recentTasks')
      }

      const results = await Promise.allSettled(promises)
      
      // Process results based on role
      processRoleSpecificData(results, apiCalls)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processRoleSpecificData = (results, apiCalls) => {
    // Process data based on user role and permissions
    const newStats = {}
    const newRecentItems = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value.data
        const callType = apiCalls[index]
        
        // Process based on the API call type
        switch (callType) {
          case 'requestStats':
            newStats.requests = {
              total: data.total || 0,
              open: data.open || 0,
              assigned: data.assigned || 0,
              critical: data.critical || 0,
              overdue: data.overdue || 0
            }
            break
            
          case 'recentRequests':
            if (data.results) {
              newRecentItems.push(...data.results.slice(0, 3).map(item => ({
                ...item,
                type: 'request',
                title: item.title || `Request #${item.id}`,
                subtitle: `Priority: ${item.priority || 'Medium'}`,
                status: item.status,
                date: item.created_at
              })))
            }
            break
            
          case 'equipmentStats':
            newStats.equipment = {
              total: data.total || 0,
              active: data.active || 0,
              maintenance: data.maintenance || 0,
              critical: data.critical || 0,
              operational: data.operational || 0
            }
            break
            
          case 'taskStats':
            newStats.tasks = {
              total: data.total || 0,
              pending: data.pending || 0,
              in_progress: data.in_progress || 0,
              completed: data.completed || 0,
              overdue: data.overdue || 0
            }
            break
            
          case 'recentTasks':
            if (data.results) {
              newRecentItems.push(...data.results.slice(0, 3).map(item => ({
                ...item,
                type: 'task',
                title: item.title || `Task #${item.id}`,
                subtitle: `Assigned to: ${item.assigned_to_name || 'Unassigned'}`,
                status: item.status,
                date: item.created_at
              })))
            }
            break
            
          default:
            console.warn(`Unknown API call type: ${callType}`)
        }
      } else {
        console.error(`API call failed for ${apiCalls[index]}:`, result.reason)
      }
    })

    setStats(newStats)
    setRecentItems(newRecentItems.slice(0, 5))
  }

  const getQuickActions = () => {
    const actions = []

    if (hasPermission('requests.create')) {
      actions.push({
        title: 'Submit Request',
        description: 'Create a new IT support request',
        icon: ExclamationTriangleIcon,
        color: 'bg-blue-600 hover:bg-blue-700',
        onClick: () => navigate('/app/requests/new')
      })
    }

    if (hasPermission('tasks.create')) {
      actions.push({
        title: 'Create Task',
        description: 'Add a new task or assignment',
        icon: ClipboardDocumentListIcon,
        color: 'bg-green-600 hover:bg-green-700',
        onClick: () => navigate('/app/tasks/new')
      })
    }

    if (hasPermission('equipment.create')) {
      actions.push({
        title: 'Add Equipment',
        description: 'Register new IT equipment',
        icon: ComputerDesktopIcon,
        color: 'bg-purple-600 hover:bg-purple-700',
        onClick: () => navigate('/app/inventory/new')
      })
    }

    if (hasPermission('users.create')) {
      actions.push({
        title: 'Manage Users',
        description: 'User management and approval',
        icon: UserGroupIcon,
        color: 'bg-orange-600 hover:bg-orange-700',
        onClick: () => navigate('/app/admin/users')
      })
    }

    return actions
  }

  const getRoleSpecificCards = () => {
    const cards = []

    // End User Dashboard
    if (userRole === 'end_user') {
      cards.push(
        <Card key="my-requests" className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
              My Support Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.requests?.total || 0}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.requests?.open || 0}</div>
                <div className="text-xs text-gray-600">Open</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.requests?.assigned || 0}</div>
                <div className="text-xs text-gray-600">Assigned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Technician Dashboard
    if (userRole === 'technician' || userRole === 'senior_technician') {
      cards.push(
        <Card key="my-tasks" className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-5 h-5 text-green-600" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.tasks?.total || 0}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.tasks?.pending || 0}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.tasks?.in_progress || 0}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Manager/Admin Dashboard
    if (userRole === 'it_manager' || userRole === 'system_admin') {
      cards.push(
        <Card key="equipment-overview" className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ComputerDesktopIcon className="w-5 h-5 text-purple-600" />
              Equipment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.equipment?.total || 0}</div>
                <div className="text-xs text-gray-600">Total Assets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.equipment?.critical || 0}</div>
                <div className="text-xs text-gray-600">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return cards
  }

  const getWelcomeMessage = () => {
    const timeOfDay = new Date().getHours()
    let greeting = 'Good morning'
    if (timeOfDay >= 12 && timeOfDay < 17) greeting = 'Good afternoon'
    if (timeOfDay >= 17) greeting = 'Good evening'

    const roleMessages = {
      end_user: 'Submit requests and track your IT support tickets.',
      technician: 'Manage your assigned tasks and support requests.',
      senior_technician: 'Oversee technical operations and mentor team members.',
      it_manager: 'Monitor team performance and system operations.',
      system_admin: 'Maintain system security and user management.'
    }

    return {
      greeting: `${greeting}, ${user?.first_name || user?.username || 'User'}!`,
      message: roleMessages[userRole] || 'Welcome to the IT Support Portal.'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const welcome = getWelcomeMessage()
  const quickActions = getQuickActions()
  const roleCards = getRoleSpecificCards()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{welcome.greeting}</h1>
        <p className="text-blue-100">{welcome.message}</p>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`h-auto p-4 flex flex-col items-center gap-2 text-white ${action.color}`}
            >
              <action.icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {/* Role-specific Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleCards}
      </div>

      {/* Recent Activity */}
      {recentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} type={item.type} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/app/${item.type === 'request' ? 'requests' : 'tasks'}/${item.id}`)}
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RoleBasedDashboard
