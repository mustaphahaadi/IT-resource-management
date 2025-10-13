import { useState, useEffect } from "react"
import { apiService } from "../../services/api"
import { NativeSelect } from "../ui/native-select"
import AsyncSelect from "../ui/AsyncSelect"
import { Textarea } from "../ui/textarea"
import UserSelect from "../ui/user-select"
import { usePermissions } from "../../contexts/PermissionsContext"

const TaskForm = ({ task, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    assigned_to: "",
    due_date: "",
    estimated_hours: "",
    related_request: "",
  })
  const [requests, setRequests] = useState([])
  const { hasPermission } = usePermissions()

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "pending",
        assigned_to: task.assigned_to ? String(task.assigned_to) : "",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        estimated_hours: task.estimated_hours || "",
        related_request: task.related_request || "",
      })
    }
  }, [task])

  useEffect(() => {
    // Load support requests for selection
    const fetchRequests = async () => {
      try {
        const res = await apiService.getSupportRequests({ page_size: 100 })
        const data = res.data.results || res.data
        setRequests(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error("Error fetching support requests:", e)
        setRequests([])
      }
    }
    fetchRequests()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...formData }
    if (payload.due_date && !payload.due_date.includes("T")) {
      // Convert date to DateTime (UTC midnight)
      payload.due_date = `${payload.due_date}T00:00:00Z`
    }
    // Normalize empty strings to null where appropriate
    if (payload.assigned_to === "") payload.assigned_to = null
    if (payload.estimated_hours === "") payload.estimated_hours = null
    onSubmit(payload)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{task ? "Edit Task" : "Create New Task"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <AsyncSelect
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Support Request</label>
              <AsyncSelect
                name="related_request"
                value={formData.related_request}
                onChange={handleChange}
                options={requests.map(r => ({ value: r.id, label: `${r.ticket_number} - ${r.title}` }))}
                className="w-full"
                placeholder="Select Request"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
              {hasPermission('tasks.assign') ? (
                <UserSelect
                  name="assigned_to"
                  value={formData.assigned_to ?? ""}
                  onChange={handleChange}
                  userType="personnel"
                  placeholder="Select Personnel"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                  You do not have permission to assign tasks.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <AsyncSelect
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'assigned', label: 'Assigned' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
