import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../services/api"
import TaskForm from "../components/Tasks/TaskForm"
import PersonnelPanel from "../components/Tasks/PersonnelPanel"
import TaskDetails from "../components/Tasks/TaskDetails"

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [personnel, setPersonnel] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showPersonnelPanel, setShowPersonnelPanel] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    search: "",
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { taskId } = useParams()

  const getBasePath = () => (location.pathname.startsWith("/app/") ? "/app/tasks" : "/tasks")

  useEffect(() => {
    fetchTasks()
    fetchPersonnel()
  }, [filters])

  useEffect(() => {
    const openNew = location.pathname.endsWith("/new")
    const openEdit = location.pathname.endsWith("/edit")

    if (openNew) {
      setSelectedTask(null)
      setShowTaskForm(true)
      return
    }

    if (taskId && openEdit) {
      const existing = tasks.find((t) => t.id?.toString() === taskId)
      if (existing) {
        setSelectedTask(existing)
      } else {
        apiService
          .getTask(taskId)
          .then((res) => setSelectedTask(res.data))
          .catch(() => {})
      }
      setShowTaskForm(true)
      return
    }

    if (taskId) {
      const existing = tasks.find((t) => t.id?.toString() === taskId)
      if (existing) {
        setSelectedTask(existing)
      } else {
        apiService
          .getTask(taskId)
          .then((res) => setSelectedTask(res.data))
          .catch(() => {})
      }
      setShowTaskForm(false)
      return
    }

    // default close
    setShowTaskForm(false)
    setSelectedTask(null)
  }, [location.pathname, taskId, tasks])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.assignee) params.assigned_to = filters.assignee
      if (filters.search) params.search = filters.search
      const res = await apiService.getTasks(params)
      const data = res.data.results || res.data
      setTasks(Array.isArray(data) ? data : [])
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonnel = async () => {
    try {
      const res = await apiService.getPersonnel({ page_size: 100 })
      const data = res.data.results || res.data
      setPersonnel(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching personnel:", error)
      setPersonnel([])
    }
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        await apiService.updateTask(selectedTask.id, taskData)
      } else {
        await apiService.createTask(taskData)
      }
      await fetchTasks()
      navigate(getBasePath())
      setShowTaskForm(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleTaskAssign = async (taskId, personnelId) => {
    try {
      await apiService.assignTask(taskId, personnelId)
      const updated = await fetchTasks()
      if (selectedTask) {
        const refreshed = updated.find((t) => t.id === selectedTask.id)
        if (refreshed) setSelectedTask(refreshed)
      }
    } catch (error) {
      console.error("Error assigning task:", error)
    }
  }

  const handleStatusUpdate = async (taskId, status) => {
    try {
      if (status === "in_progress") {
        await apiService.startTask(taskId)
      } else if (status === "completed") {
        await apiService.completeTask(taskId)
      } else {
        await apiService.updateTask(taskId, { status })
      }
      const updated = await fetchTasks()
      if (selectedTask) {
        const refreshed = updated.find((t) => t.id === selectedTask.id)
        if (refreshed) setSelectedTask(refreshed)
      }
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-blue-200 text-blue-900",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Assign and track IT tasks and workflows</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPersonnelPanel(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <UserGroupIcon className="w-4 h-4" />
            <span>Manage Personnel</span>
          </Button>
          <Button
            onClick={() => navigate(`${getBasePath()}/new`)}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Assignees</option>
              {personnel.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.user_name || person.username}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
                <span>Tasks Overview ({tasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-500 mb-4">
                    {Object.values(filters).some(f => f) 
                      ? "Try adjusting your filters" 
                      : "Create your first task to get started"
                    }
                  </p>
                  <Button onClick={() => setShowTaskForm(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`${getBasePath()}/${task.id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{task.title}</h3>
                          <p className="text-gray-600 text-sm">{task.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{task.assigned_to_name || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{task.estimated_hours}h estimated</span>
                      </div>
                      {task.request_ticket && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Req {task.request_ticket}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Created {new Date(task.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {task.status !== "completed" && (
                          <select
                            value={task.assigned_to || ""}
                            onChange={(e) => handleTaskAssign(task.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Assign to...</option>
                              {personnel.map((person) => (
                                <option key={person.id} value={person.id}>
                                  {person.user_name || person.username}
                                </option>
                              ))}
                            </select>
                        )}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-gray-900">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    {tasks.filter((t) => t.status === "pending").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">
                    {tasks.filter((t) => t.status === "in_progress").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">
                    {tasks.filter((t) => t.status === "completed").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="font-semibold text-gray-600">
                    {tasks.filter((t) => t.status === "cancelled").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Personnel Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personnel.map((person) => {
                  const assignedTasks = tasks.filter((t) => t.assigned_to === person.id && t.status !== "completed")
                  return (
                    <div key={person.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{person.user_name || person.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{person.skill_level}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assignedTasks.length > 5
                            ? "bg-red-100 text-red-700"
                            : assignedTasks.length > 3
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {assignedTasks.length} tasks
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <TaskForm
          task={selectedTask}
          personnel={personnel}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            navigate(getBasePath())
            setShowTaskForm(false)
            setSelectedTask(null)
          }}
        />
      )}

      {selectedTask && !showTaskForm && (
        <TaskDetails
          task={selectedTask}
          personnel={personnel}
          onClose={() => navigate(getBasePath())}
          onEdit={() => navigate(`${getBasePath()}/${selectedTask?.id}/edit`)}
          onAssign={handleTaskAssign}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {showPersonnelPanel && (
        <PersonnelPanel
          personnel={personnel}
          onClose={() => setShowPersonnelPanel(false)}
          onUpdate={async () => {
            await fetchPersonnel()
            await fetchTasks()
          }}
        />
      )}
    </div>
  )
}

export default Tasks
