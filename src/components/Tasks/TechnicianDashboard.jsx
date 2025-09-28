import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { usePermissions } from "../../contexts/PermissionsContext"
import { apiService } from "../../services/api"
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  UserIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"

const TechnicianDashboard = ({ onTaskSelect }) => {
  const { user, userRole } = usePermissions()
  const [stats, setStats] = useState({})
  const [myTasks, setMyTasks] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeFilter, setActiveFilter] = useState("active") // active, all, completed

  useEffect(() => {
    if (userRole === 'technician' || userRole === 'staff' || userRole === 'admin') {
      fetchDashboardData()
    }
  }, [userRole])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch dashboard stats and upcoming tasks
      const dashboardResponse = await apiService.getTechnicianDashboard()
      if (dashboardResponse?.data) {
        setStats(dashboardResponse.data.stats || {})
        setUpcomingTasks(dashboardResponse.data.upcoming_tasks || [])
      }

      // Fetch my tasks based on filter
      await fetchMyTasks()

    } catch (error) {
      console.error('Error fetching technician dashboard:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyTasks = async () => {
    try {
      let statusFilter = null
      if (activeFilter === 'active') {
        statusFilter = 'assigned,in_progress'
      } else if (activeFilter === 'completed') {
        statusFilter = 'completed'
      }

      const tasksResponse = await apiService.getMyTasks(statusFilter)
      if (tasksResponse?.data) {
        setMyTasks(Array.isArray(tasksResponse.data) ? tasksResponse.data : tasksResponse.data.results || [])
      }
    } catch (error) {
      console.error('Error fetching my tasks:', error)
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchMyTasks()
    }
  }, [activeFilter])

  const handleTaskAction = async (taskId, action, additionalData = {}) => {
    try {
      let response
      switch (action) {
        case 'start':
          response = await apiService.startTask(taskId)
          break
        case 'complete':
          response = await apiService.completeTask(taskId, additionalData.notes, additionalData.hours)
          break
        default:
          return
      }

      if (response?.data) {
        // Refresh data
        fetchDashboardData()
      }
    } catch (error) {
      console.error(`Error performing ${action} on task:`, error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  if (userRole !== 'technician' && userRole !== 'staff' && userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Technician dashboard is only available for technical staff.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-600">
            Tasks assigned to you • {user?.department && (
              <span className="capitalize">{user.department} Department</span>
            )}
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" className="flex items-center gap-2">
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active_tasks || 0}</p>
              </div>
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
            </div>
            {stats.workload_percentage !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Workload</span>
                  <span className={`font-medium ${stats.is_overloaded ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.round(stats.workload_percentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full ${stats.is_overloaded ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(stats.workload_percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue_tasks || 0}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Priority</p>
                <p className="text-2xl font-bold text-orange-600">{stats.critical_tasks || 0}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed_today || 0}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Filters */}
      <div className="flex gap-2">
        <Button
          variant={activeFilter === 'active' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('active')}
          size="sm"
        >
          Active Tasks
        </Button>
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('all')}
          size="sm"
        >
          All Tasks
        </Button>
        <Button
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('completed')}
          size="sm"
        >
          Completed
        </Button>
      </div>

      {/* Tasks List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Tasks List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Tasks</span>
                <Badge variant="secondary">{myTasks.length} tasks</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : myTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks found</p>
                  <p className="text-sm">
                    {activeFilter === 'active' ? 'You have no active tasks assigned.' : 
                     activeFilter === 'completed' ? 'No completed tasks found.' : 
                     'No tasks assigned to you.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myTasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 
                              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                              onClick={() => onTaskSelect && onTaskSelect(task)}
                            >
                              {task.title}
                            </h3>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          {task.related_request && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              <span>Request: {task.related_request.ticket_number}</span>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarDaysIcon className="w-3 h-3" />
                              Created {formatTimeAgo(task.created_at)}
                            </span>
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                Due {formatTimeAgo(task.due_date)}
                              </span>
                            )}
                            {task.estimated_hours && (
                              <span>{task.estimated_hours}h estimated</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {task.status === 'assigned' && (
                            <Button
                              size="sm"
                              onClick={() => handleTaskAction(task.id, 'start')}
                              className="flex items-center gap-1"
                            >
                              <PlayIcon className="w-3 h-3" />
                              Start
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleTaskAction(task.id, 'complete', { notes: '', hours: task.estimated_hours })}
                              className="flex items-center gap-1"
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTaskSelect && onTaskSelect(task)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingTasks.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-medium text-sm text-gray-900 cursor-pointer hover:text-blue-600 mb-1"
                            onClick={() => onTaskSelect && onTaskSelect(task)}
                          >
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge size="sm" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.due_date && (
                              <span className="text-xs text-gray-500">
                                Due {formatTimeAgo(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TechnicianDashboard
