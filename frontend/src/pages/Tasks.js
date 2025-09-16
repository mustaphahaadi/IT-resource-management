"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import TaskForm from "../components/Tasks/TaskForm"
import TaskDetails from "../components/Tasks/TaskDetails"
import TaskFilters from "../components/Tasks/TaskFilters"
import PersonnelPanel from "../components/Tasks/PersonnelPanel"

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
      const response = await apiService.get("/tasks/", { params: filters })
      setTasks(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonnel = async () => {
    try {
      const response = await apiService.get("/personnel/")
      setPersonnel(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching personnel:", error)
    }
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        await apiService.put(`/tasks/${selectedTask.id}/`, taskData)
      } else {
        await apiService.post("/tasks/", taskData)
      }
      fetchTasks()
      setShowTaskForm(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleTaskAssign = async (taskId, personnelId) => {
    try {
      await apiService.patch(`/tasks/${taskId}/`, { assigned_to: personnelId })
      fetchTasks()
    } catch (error) {
      console.error("Error assigning task:", error)
    }
  }

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await apiService.patch(`/tasks/${taskId}/`, { status })
      fetchTasks()
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">Assign and track IT tasks and workflows</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPersonnelPanel(true)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Manage Personnel
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create Task
          </button>
        </div>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} personnel={personnel} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Tasks Overview</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found. Create your first task to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority?.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status?.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-4">
                          <span>
                            <strong>Assigned to:</strong> {task.assigned_to_name || "Unassigned"}
                          </span>
                          <span>
                            <strong>Due:</strong>{" "}
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {task.status !== "completed" && (
                            <select
                              value={task.assigned_to || ""}
                              onChange={(e) => handleTaskAssign(task.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1 border border-border rounded text-xs"
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
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 border border-border rounded text-xs"
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
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Task Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tasks</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">
                  {tasks.filter((t) => t.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium text-blue-600">
                  {tasks.filter((t) => t.status === "in_progress").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-green-600">
                  {tasks.filter((t) => t.status === "completed").length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Personnel Workload</h3>
            <div className="space-y-3">
              {personnel.map((person) => {
                const assignedTasks = tasks.filter((t) => t.assigned_to === person.id && t.status !== "completed")
                return (
                  <div key={person.id} className="flex justify-between items-center">
                    <span className="text-sm">{person.name}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        assignedTasks.length > 5
                          ? "bg-red-100 text-red-800"
                          : assignedTasks.length > 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {assignedTasks.length} tasks
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          task={selectedTask}
          personnel={personnel}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            setShowTaskForm(false)
            setSelectedTask(null)
          }}
        />
      )}

      {selectedTask && !showTaskForm && (
        <TaskDetails
          task={selectedTask}
          personnel={personnel}
          onClose={() => setSelectedTask(null)}
          onEdit={() => setShowTaskForm(true)}
          onAssign={handleTaskAssign}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {showPersonnelPanel && (
        <PersonnelPanel personnel={personnel} onClose={() => setShowPersonnelPanel(false)} onUpdate={fetchPersonnel} />
      )}
    </div>
  )
}

export default Tasks
