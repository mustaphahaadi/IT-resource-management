import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { apiService } from "../../services/api"

const RequestForm = ({ request, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    channel: "web",
    requester_phone: "",
    requester_department: "",
    requester_location: "",
    related_equipment: "",
  })
  const [categories, setCategories] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchFormData()
    if (request) {
      setFormData({
        ...request,
        category: request.category || "",
        related_equipment: request.related_equipment || "",
      })
    }
  }, [request])

  const fetchFormData = async () => {
    try {
      const [categoriesRes, equipmentRes] = await Promise.all([
        apiService.get("/requests/categories/"),
        apiService.get("/inventory/equipment/"),
      ])
      setCategories(categoriesRes.data.results || categoriesRes.data)
      setEquipment(equipmentRes.data.results || equipmentRes.data)
    } catch (error) {
      console.error("Error fetching form data:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (request) {
        await apiService.updateSupportRequest(request.id, formData)
      } else {
        await apiService.createSupportRequest(formData)
      }
      onSuccess()
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{request ? "Edit Request" : "Create New Support Request"}</CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Detailed description of the issue, steps to reproduce, and any error messages"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="low">Low - Enhancement/Non-urgent</option>
                  <option value="medium">Medium - Standard Request</option>
                  <option value="high">High - Operations Impact</option>
                  <option value="critical">Critical - Patient Care Impact</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Request Channel</label>
                <select
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="web">Web Portal</option>
                  <option value="mobile">Mobile App</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="walk_in">Walk-in</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Related Equipment</label>
                <select
                  name="related_equipment"
                  value={formData.related_equipment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Equipment (Optional)</option>
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.asset_tag})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="requester_phone"
                  value={formData.requester_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Contact phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Department *</label>
                <input
                  type="text"
                  name="requester_department"
                  required
                  value={formData.requester_department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location *</label>
                <input
                  type="text"
                  name="requester_location"
                  required
                  value={formData.requester_location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Building, floor, room number"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : request ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RequestForm
