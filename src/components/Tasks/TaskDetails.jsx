import { useState, useEffect } from "react"
import { apiService } from "../../services/api"

const TaskDetails = ({ task, personnel, onClose, onEdit, onAssign, onStatusUpdate }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [timeEntries, setTimeEntries] = useState([])
  const [newTimeEntry, setNewTimeEntry] = useState({ hours: "", description: "" })

  useEffect(() => {
    if (task) {
      fetchComments()
      fetchTimeEntries()
    }
  }, [task])

  const fetchComments = async () => {
    try {
      const response = await apiService.get(`/tasks/${task.id}/comments/`)
      setComments(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const fetchTimeEntries = async () => {
    try {
      const response = await apiService.get(`/tasks/${task.id}/time-entries/`)
      setTimeEntries(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching time entries:", error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await apiService.post(`/tasks/${task.id}/comments/`, {
        content,
        task: task.id,
      })
      setNewComment("")
      fetchComments()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleAddTimeEntry = async (e) => {
    e.preventDefault()
    if (!newTimeEntry.hours || !newTimeEntry.description) return

    try {
      await apiService.post(`/tasks/${task.id}/time-entries/`, {
        ...newTimeEntry,
        task: task.id,
      })
      setNewTimeEntry({ hours: "", description: "" })
      fetchTimeEntries()
    } catch (error) {
      console.error("Error adding time entry:", error)
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

  const totalHours = timeEntries.reduce((sum, entry) => sum + Number.parseFloat(entry.hours || 0), 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
            <div className="flex gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority?.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status?.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Edit
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{task.description || "No description provided"}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Comments</h3>
              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{comment.author_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add
                </button>
              </form>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Time Tracking</h3>
              <div className="space-y-2 mb-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-2 border border-border rounded">
                    <span>{entry.description}</span>
                    <span className="font-medium">{entry.hours}h</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddTimeEntry} className="flex gap-2">
                <input
                  type="number"
                  value={newTimeEntry.hours}
                  onChange={(e) => setNewTimeEntry((prev) => ({ ...prev, hours: e.target.value }))}
                  placeholder="Hours"
                  step="0.5"
                  min="0"
                  className="w-20 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={newTimeEntry.description}
                  onChange={(e) => setNewTimeEntry((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Log
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-accent/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Task Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span>{task.assigned_to_name || "Unassigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="capitalize">{task.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated:</span>
                  <span>{task.estimated_hours || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logged:</span>
                  <span>{totalHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Reassign Task</label>
                <select
                  value={task.assigned_to || ""}
                  onChange={(e) => onAssign(task.id, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Unassigned</option>
                  {personnel.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} - {person.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Update Status</label>
                <select
                  value={task.status}
                  onChange={(e) => onStatusUpdate(task.id, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetails
