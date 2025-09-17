import { useState, useEffect } from "react"
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

  useEffect(() => {
    fetchTasks()
    fetchPersonnel()
  }, [filters])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock tasks data
      const mockTasks = [
        {
          id: 1,
          title: "Update MRI Software",
          description: "Install latest software update for MRI scanner in Radiology",
          status: "in_progress",
          priority: "high",
          assigned_to: 1,
          assigned_to_name: "John Smith",
          due_date: "2024-02-15",
          created_at: "2024-01-10T10:00:00Z",
          category: "Software Update",
          department: "Radiology",
          estimated_hours: 4
        },
        {
          id: 2,
          title: "Network Maintenance - ICU",
          description: "Perform routine network maintenance and security updates for ICU systems",
          status: "pending",
          priority: "medium",
          assigned_to: 2,
          assigned_to_name: "Sarah Johnson",
          due_date: "2024-02-20",
          created_at: "2024-01-12T14:30:00Z",
          category: "Maintenance",
          department: "ICU",
          estimated_hours: 6
        },
        {
          id: 3,
          title: "Replace Printer Cartridges",
          description: "Replace toner cartridges for all printers in Emergency Department",
          status: "completed",
          priority: "low",
          assigned_to: 3,
          assigned_to_name: "Mike Davis",
          due_date: "2024-01-25",
          created_at: "2024-01-08T09:15:00Z",
          category: "Hardware",
          department: "Emergency",
          estimated_hours: 2
        },
        {
          id: 4,
          title: "Security Audit - Laboratory Systems",
          description: "Conduct comprehensive security audit of laboratory information systems",
          status: "pending",
          priority: "critical",
          assigned_to: null,
          assigned_to_name: null,
          due_date: "2024-02-10",
          created_at: "2024-01-15T11:45:00Z",
          category: "Security",
          department: "Laboratory",
          estimated_hours: 8
        },
        {
          id: 5,
          title: "Backup System Test",
          description: "Test and verify backup systems for patient data integrity",
          status: "on_hold",
          priority: "high",
          assigned_to: 1,
          assigned_to_name: "John Smith",
          due_date: "2024-02-18",
          created_at: "2024-01-14T16:20:00Z",
          category: "System Test",
          department: "IT",
          estimated_hours: 3
        }
      ]
      
      // Apply filters
      let filteredTasks = mockTasks
      
      if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status)
      }
      
      if (filters.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority)
      }
      
      if (filters.assignee) {
        filteredTasks = filteredTasks.filter(task => task.assigned_to?.toString() === filters.assignee)
      }
      
      if (filters.search) {
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.department.toLowerCase().includes(filters.search.toLowerCase())
        )
      }
      
      setTasks(filteredTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonnel = async () => {
    try {
      // Mock personnel data
      const mockPersonnel = [
        { id: 1, name: "John Smith", role: "Senior IT Technician", department: "IT", email: "john.smith@hospital.com" },
        { id: 2, name: "Sarah Johnson", role: "Network Administrator", department: "IT", email: "sarah.johnson@hospital.com" },
        { id: 3, name: "Mike Davis", role: "Hardware Specialist", department: "IT", email: "mike.davis@hospital.com" },
        { id: 4, name: "Emily Chen", role: "Security Analyst", department: "IT", email: "emily.chen@hospital.com" },
        { id: 5, name: "David Wilson", role: "Database Administrator", department: "IT", email: "david.wilson@hospital.com" }
      ]
      
      setPersonnel(mockPersonnel)
    } catch (error) {
      console.error("Error fetching personnel:", error)
      setPersonnel([])
    }
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      // Simulate API call
      console.log('Saving task:', taskData)
      // In real implementation, would make API call here
      fetchTasks()
      setShowTaskForm(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleTaskAssign = async (taskId, personnelId) => {
    try {
      // Simulate API call
      console.log(`Assigning task ${taskId} to personnel ${personnelId}`)
      // Update local state for demo
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                assigned_to: parseInt(personnelId), 
                assigned_to_name: personnel.find(p => p.id === parseInt(personnelId))?.name || null 
              }
            : task
        )
      )
    } catch (error) {
      console.error("Error assigning task:", error)
    }
  }

  const handleStatusUpdate = async (taskId, status) => {
    try {
      // Simulate API call
      console.log(`Updating task ${taskId} status to ${status}`)
      // Update local state for demo
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      )
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      on_hold: "bg-gray-100 text-gray-800",
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
            onClick={() => setShowTaskForm(true)}
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
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
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
                  {person.name}
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
                      onClick={() => setSelectedTask(task)}
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
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {task.department}
                        </span>
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
                                  {person.name}
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
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
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
                  <span className="text-gray-600">On Hold</span>
                  <span className="font-semibold text-gray-600">
                    {tasks.filter((t) => t.status === "on_hold").length}
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
                        <p className="text-sm font-medium text-gray-900">{person.name}</p>
                        <p className="text-xs text-gray-500">{person.role}</p>
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

      {/* Simple modals - placeholders */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedTask ? 'Edit Task' : 'Create Task'}
            </h3>
            <p className="text-gray-600 mb-4">Task form will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowTaskForm(false)
                setSelectedTask(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleTaskSubmit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedTask && !showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Task Details</h3>
            <div className="space-y-3">
              <div><strong>Title:</strong> {selectedTask.title}</div>
              <div><strong>Description:</strong> {selectedTask.description}</div>
              <div><strong>Status:</strong> {selectedTask.status}</div>
              <div><strong>Priority:</strong> {selectedTask.priority}</div>
              <div><strong>Assigned to:</strong> {selectedTask.assigned_to_name || 'Unassigned'}</div>
              <div><strong>Due Date:</strong> {selectedTask.due_date || 'No due date'}</div>
              <div><strong>Department:</strong> {selectedTask.department}</div>
              <div><strong>Estimated Hours:</strong> {selectedTask.estimated_hours}h</div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
              <Button onClick={() => setShowTaskForm(true)}>
                Edit Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPersonnelPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Manage Personnel</h3>
            <p className="text-gray-600 mb-4">Personnel management will be implemented here.</p>
            <div className="flex justify-end">
              <Button onClick={() => setShowPersonnelPanel(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
