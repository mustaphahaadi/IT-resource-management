import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import StatusBadge from '../ui/status-badge'
import { usePermissions, PermissionGate } from '../../contexts/PermissionsContext'
import { apiService } from '../../services/api';
import EndUserDashboard from './EndUserDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import ManagerDashboard from './ManagerDashboard';
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
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await apiService.getDashboardAnalytics()
        const data = response.data

        // Set statistics, using safe fallbacks
        setStats({
          requests: data.request_stats || {},
          equipment: data.equipment_stats || {},
          tasks: data.task_stats || {},
        })

        // Set recent activity, transforming backend shape to frontend shape
        const formattedRecentItems = (data.recent_activity || []).map(item => ({
          id: item.id,
          type: item.type, // 'request' or 'task'
          title: item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} #${item.id}`,
          subtitle: item.type === 'request' 
            ? `Priority: ${item.priority || 'Medium'}` 
            : `Assigned to: ${item.assigned_to_name || 'Unassigned'}`,
          status: item.status,
          date: item.created_at,
        }))
        setRecentItems(formattedRecentItems)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Set empty state on error to prevent crashes
        setStats({ requests: {}, equipment: {}, tasks: {} })
        setRecentItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, []) // Run only once on component mount


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

  const renderRoleSpecificDashboard = () => {
    switch (userRole) {
      case 'end_user':
        return <EndUserDashboard stats={stats.requests} />;
      case 'technician':
      case 'senior_technician':
        return <TechnicianDashboard />;
      case 'it_manager':
      case 'system_admin':
        return <ManagerDashboard />;
      default:
        return null;
    }
  };

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

  const welcome = getWelcomeMessage();
  const quickActions = getQuickActions();

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

      {/* Role-specific Dashboard */}
      <div>
        {renderRoleSpecificDashboard()}
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
