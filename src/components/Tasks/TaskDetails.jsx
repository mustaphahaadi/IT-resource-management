import { useState, useEffect } from "react"
import { apiService } from "../../services/api"
import { NativeSelect } from "../ui/native-select"

const TaskDetails = ({ task, personnel, onClose, onEdit, onAssign, onStatusUpdate }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    if (task) {
      fetchComments()
    }
  }, [task])

  const fetchComments = async () => {
    try {
      const response = await apiService.getTaskComments(task.id)
      setComments(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  // Time tracking not implemented in backend yet; hiding for now

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await apiService.addTaskComment(task.id, newComment.trim())
      setNewComment("")
      fetchComments()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  // Time tracking submission is disabled until backend is available

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

  // const totalHours = timeEntries.reduce((sum, entry) => sum + Number.parseFloat(entry.hours || 0), 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{comment.author_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{comment.comment}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Time Tracking hidden until backend support is added */}
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
                  <span className="text-muted-foreground">Request:</span>
                  <span>{task.request_ticket ? `${task.request_ticket} - ${task.request_title}` : "N/A"}</span>
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
                  <span className="text-muted-foreground">Actual:</span>
                  <span>{task.actual_hours || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reassign Task</label>
                <NativeSelect
                  value={task.assigned_to || ""}
                  onChange={(e) => onAssign(task.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {personnel.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.user_name || person.username} - {person.skill_level}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <NativeSelect
                  value={task.status}
                  onChange={(e) => onStatusUpdate(task.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </NativeSelect>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetails
