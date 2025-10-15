import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { NativeSelect } from "../ui/native-select"
import AsyncSelect from "../ui/AsyncSelect"
import useOptions from "../../hooks/useOptions"
import { Textarea } from "../ui/textarea"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { apiService } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

const RequestForm = ({ request, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    channel: "web_portal",
    requester_phone: "",
    requester_department: "",
    requester_location: "",
    related_equipment: "",
  })
  // categories and equipment options fetched from backend
  const { options: categories, loading: loadingCategories, error: categoriesError } = useOptions('/requests/categories/', (c) => ({ value: c.id, label: c.name }))
  const { options: equipment, loading: loadingEquipment, error: equipmentError } = useOptions('/inventory/equipment/', (e) => ({ value: e.id, label: `${e.name} (${e.asset_tag || ''})` }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (request) {
      setFormData({
        ...request,
        category: request.category || "",
        related_equipment: request.related_equipment || "",
      })
    }
  }, [request])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Client-side validation: required fields
    const requiredFields = [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'requester_department', label: 'Department' },
      { key: 'requester_location', label: 'Location' },
    ]

    for (const field of requiredFields) {
      const value = formData[field.key]
      if (value === null || value === undefined || value === '') {
        setError(`${field.label} is required.`)
        setLoading(false)
        return
      }
    }

    // Prepare payload to match backend expectations
    const payload = { ...formData }
    payload.category = payload.category ? Number(payload.category) : null
    payload.related_equipment = payload.related_equipment ? Number(payload.related_equipment) : null
    
    // Backend requires these fields
    if (!payload.ticket_number) {
      payload.ticket_number = `TMP-${Date.now()}`
    }
    if (!payload.requester && user) {
      payload.requester = user.id  // Use authenticated user's ID
    }
    
    // Remove read-only fields
    delete payload.id
    delete payload.status
    delete payload.created_at
    delete payload.updated_at

    try {
      console.log('=== SUBMITTING SUPPORT REQUEST ===')
      console.log('Payload:', JSON.stringify(payload, null, 2))

      if (request) {
        await apiService.updateSupportRequest(request.id, payload)
      } else {
        await apiService.createSupportRequest(payload)
      }
      onSuccess()
    } catch (error) {
      console.error('=== SUPPORT REQUEST ERROR ===')
      console.error('Status:', error.response?.status)
      console.error('Error Data:', JSON.stringify(error.response?.data, null, 2))
      console.error('Payload Sent:', JSON.stringify(payload, null, 2))
      const serverData = error.response?.data || null

      // Helper: convert server error payload to user-friendly string
      const formatServerError = (data) => {
        if (!data) return error.message || 'An error occurred'
        // If backend sends { message: '...' }
        if (typeof data === 'string') return data
        if (data.message) return data.message
        // If backend sends a dict of field errors, join them
        if (typeof data === 'object') {
          try {
            const parts = []
            for (const [k, v] of Object.entries(data)) {
              // v can be array of messages or nested object
              if (Array.isArray(v)) {
                parts.push(`${k}: ${v.join('; ')}`)
              } else if (typeof v === 'object') {
                parts.push(`${k}: ${JSON.stringify(v)}`)
              } else {
                parts.push(`${k}: ${v}`)
              }
            }
            return parts.join(' | ')
          } catch (e) {
            return JSON.stringify(data)
          }
        }
        return String(data)
      }

      setError(formatServerError(serverData))
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <Textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed description of the issue, steps to reproduce, and any error messages"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <AsyncSelect
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    options={categories}
                    loading={loadingCategories}
                    error={categoriesError}
                    placeholder="Select Category"
                    className="w-full"
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <AsyncSelect
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={[
                    { value: 'low', label: 'Low - Enhancement/Non-urgent' },
                    { value: 'medium', label: 'Medium - Standard Request' },
                    { value: 'high', label: 'High - Operations Impact' },
                    { value: 'critical', label: 'Critical - Patient Care Impact' },
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Channel</label>
                <AsyncSelect
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  options={[
                    { value: 'web_portal', label: 'Web Portal' },
                    { value: 'mobile_app', label: 'Mobile App' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'email', label: 'Email' },
                    { value: 'walk_in', label: 'Walk-in' },
                    { value: 'chat', label: 'Live Chat' },
                    { value: 'self_service', label: 'Self-Service' },
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Equipment</label>
                <AsyncSelect
                  name="related_equipment"
                  value={formData.related_equipment}
                  onChange={handleChange}
                  options={equipment}
                  loading={loadingEquipment}
                  error={equipmentError}
                  placeholder="Select Equipment (Optional)"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="requester_phone"
                  value={formData.requester_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contact phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <input
                  type="text"
                  name="requester_department"
                  required
                  value={formData.requester_department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="requester_location"
                  required
                  value={formData.requester_location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Building, floor, room number"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border border-gray-300 text-gray-700 hover:bg-gray-50">
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
