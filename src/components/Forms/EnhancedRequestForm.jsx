import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { usePermissions } from "../../contexts/PermissionsContext"
import { apiService } from "../../services/api"
import {
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CameraIcon,
  PaperClipIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

const EnhancedRequestForm = ({ request, onClose, onSuccess }) => {
  const { user } = usePermissions()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    requester_phone: user?.phone || '',
    requester_department: user?.department || '',
    requester_location: '',
    related_equipment: '',
    urgency_reason: '',
    business_impact: '',
    preferred_resolution_time: '',
    alternative_contact: '',
    additional_users_affected: '',
    steps_taken: '',
    error_messages: '',
    attachments: [],
    is_recurring: false,
    recurring_frequency: '',
    budget_approval_needed: false,
    budget_amount: '',
    vendor_involved: false,
    vendor_name: '',
    security_sensitive: false,
    compliance_required: false,
    patient_care_impact: false,
    downtime_acceptable: true,
    preferred_schedule: '',
    notification_preferences: {
      email: true,
      sms: false,
      in_app: true
    }
  })
  
  const [categories, setCategories] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchFormData()
    if (request) {
      populateForm(request)
    }
  }, [request])

  const fetchFormData = async () => {
    try {
      const [categoriesRes, equipmentRes] = await Promise.all([
        apiService.getRequestCategories(),
        apiService.getEquipment()
      ])
      
      setCategories(categoriesRes?.data || [])
      setEquipment(equipmentRes?.data?.results || equipmentRes?.data || [])
    } catch (error) {
      console.error('Error fetching form data:', error)
    }
  }

  const populateForm = (requestData) => {
    setFormData({
      ...formData,
      ...requestData,
      related_equipment: requestData.related_equipment?.id || '',
      category: requestData.category?.id || '',
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.requester_location.trim()) {
      newErrors.requester_location = 'Location is required'
    }

    if (formData.priority === 'critical' && !formData.urgency_reason.trim()) {
      newErrors.urgency_reason = 'Urgency reason is required for critical priority'
    }

    if (formData.budget_approval_needed && !formData.budget_amount) {
      newErrors.budget_amount = 'Budget amount is required when approval is needed'
    }

    if (formData.vendor_involved && !formData.vendor_name.trim()) {
      newErrors.vendor_name = 'Vendor name is required when vendor is involved'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const submitData = {
        ...formData,
        related_equipment: formData.related_equipment || null,
        category: formData.category,
      }

      let response
      if (request) {
        response = await apiService.updateSupportRequest(request.id, submitData)
      } else {
        response = await apiService.createSupportRequest(submitData)
      }

      // Handle file uploads if any
      if (formData.attachments.length > 0) {
        // Implement file upload logic here
        console.log('Files to upload:', formData.attachments)
      }

      onSuccess?.(response.data)
      onClose?.()
    } catch (error) {
      console.error('Error submitting request:', error)
      setErrors({ submit: 'Failed to submit request. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              {request ? 'Edit Support Request' : 'Create Support Request'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Request Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of the issue"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide detailed information about the issue, including what happened, when it occurred, and any error messages"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor('low')}>Low</Badge>
                          <span>Non-urgent, can wait</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor('medium')}>Medium</Badge>
                          <span>Standard request</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor('high')}>High</Badge>
                          <span>Impacts operations</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor('critical')}>Critical</Badge>
                          <span>Patient care impact</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="related_equipment">Related Equipment</Label>
                  <Select value={formData.related_equipment} onValueChange={(value) => handleInputChange('related_equipment', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          <div className="flex items-center gap-2">
                            <ComputerDesktopIcon className="w-4 h-4" />
                            <span>{item.name} - {item.asset_tag}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Priority-specific fields */}
            {formData.priority === 'critical' && (
              <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900">Critical Priority Details</h4>
                <div>
                  <Label htmlFor="urgency_reason">Urgency Reason *</Label>
                  <Textarea
                    id="urgency_reason"
                    value={formData.urgency_reason}
                    onChange={(e) => handleInputChange('urgency_reason', e.target.value)}
                    placeholder="Explain why this is critical and requires immediate attention"
                    className={errors.urgency_reason ? 'border-red-500' : ''}
                  />
                  {errors.urgency_reason && <p className="text-red-500 text-sm mt-1">{errors.urgency_reason}</p>}
                </div>
                
                <div>
                  <Label htmlFor="business_impact">Business/Patient Impact</Label>
                  <Textarea
                    id="business_impact"
                    value={formData.business_impact}
                    onChange={(e) => handleInputChange('business_impact', e.target.value)}
                    placeholder="Describe the impact on business operations or patient care"
                  />
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requester_phone">Phone Number</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="requester_phone"
                      value={formData.requester_phone}
                      onChange={(e) => handleInputChange('requester_phone', e.target.value)}
                      placeholder="Your phone number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="alternative_contact">Alternative Contact</Label>
                  <Input
                    id="alternative_contact"
                    value={formData.alternative_contact}
                    onChange={(e) => handleInputChange('alternative_contact', e.target.value)}
                    placeholder="Alternative person to contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requester_location">Your Location *</Label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="requester_location"
                      value={formData.requester_location}
                      onChange={(e) => handleInputChange('requester_location', e.target.value)}
                      placeholder="Building, floor, room number"
                      className={`pl-10 ${errors.requester_location ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.requester_location && <p className="text-red-500 text-sm mt-1">{errors.requester_location}</p>}
                </div>

                <div>
                  <Label htmlFor="additional_users_affected">Other Users Affected</Label>
                  <Input
                    id="additional_users_affected"
                    value={formData.additional_users_affected}
                    onChange={(e) => handleInputChange('additional_users_affected', e.target.value)}
                    placeholder="Number or names of other affected users"
                  />
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Technical Details</h3>
              
              <div>
                <Label htmlFor="steps_taken">Steps Already Taken</Label>
                <Textarea
                  id="steps_taken"
                  value={formData.steps_taken}
                  onChange={(e) => handleInputChange('steps_taken', e.target.value)}
                  placeholder="Describe any troubleshooting steps you've already tried"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="error_messages">Error Messages</Label>
                <Textarea
                  id="error_messages"
                  value={formData.error_messages}
                  onChange={(e) => handleInputChange('error_messages', e.target.value)}
                  placeholder="Copy and paste any error messages you've seen"
                  rows={3}
                />
              </div>
            </div>

            {/* Scheduling & Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Scheduling & Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_resolution_time">Preferred Resolution Time</Label>
                  <Select value={formData.preferred_resolution_time} onValueChange={(value) => handleInputChange('preferred_resolution_time', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="When do you need this resolved?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">As soon as possible</SelectItem>
                      <SelectItem value="today">By end of today</SelectItem>
                      <SelectItem value="tomorrow">By tomorrow</SelectItem>
                      <SelectItem value="this_week">This week</SelectItem>
                      <SelectItem value="next_week">Next week</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferred_schedule">Preferred Work Schedule</Label>
                  <Input
                    id="preferred_schedule"
                    value={formData.preferred_schedule}
                    onChange={(e) => handleInputChange('preferred_schedule', e.target.value)}
                    placeholder="e.g., Mornings only, After 2 PM, Weekends OK"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="downtime_acceptable"
                  checked={formData.downtime_acceptable}
                  onCheckedChange={(checked) => handleInputChange('downtime_acceptable', checked)}
                />
                <Label htmlFor="downtime_acceptable">System downtime is acceptable for this work</Label>
              </div>
            </div>

            {/* Special Considerations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Special Considerations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="patient_care_impact"
                      checked={formData.patient_care_impact}
                      onCheckedChange={(checked) => handleInputChange('patient_care_impact', checked)}
                    />
                    <Label htmlFor="patient_care_impact">Impacts patient care</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="security_sensitive"
                      checked={formData.security_sensitive}
                      onCheckedChange={(checked) => handleInputChange('security_sensitive', checked)}
                    />
                    <Label htmlFor="security_sensitive">Security sensitive</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compliance_required"
                      checked={formData.compliance_required}
                      onCheckedChange={(checked) => handleInputChange('compliance_required', checked)}
                    />
                    <Label htmlFor="compliance_required">Compliance requirements</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="budget_approval_needed"
                      checked={formData.budget_approval_needed}
                      onCheckedChange={(checked) => handleInputChange('budget_approval_needed', checked)}
                    />
                    <Label htmlFor="budget_approval_needed">Budget approval needed</Label>
                  </div>

                  {formData.budget_approval_needed && (
                    <div>
                      <Label htmlFor="budget_amount">Estimated Cost</Label>
                      <Input
                        id="budget_amount"
                        type="number"
                        value={formData.budget_amount}
                        onChange={(e) => handleInputChange('budget_amount', e.target.value)}
                        placeholder="0.00"
                        className={errors.budget_amount ? 'border-red-500' : ''}
                      />
                      {errors.budget_amount && <p className="text-red-500 text-sm mt-1">{errors.budget_amount}</p>}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vendor_involved"
                      checked={formData.vendor_involved}
                      onCheckedChange={(checked) => handleInputChange('vendor_involved', checked)}
                    />
                    <Label htmlFor="vendor_involved">External vendor involved</Label>
                  </div>

                  {formData.vendor_involved && (
                    <div>
                      <Label htmlFor="vendor_name">Vendor Name</Label>
                      <Input
                        id="vendor_name"
                        value={formData.vendor_name}
                        onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                        placeholder="Vendor company name"
                        className={errors.vendor_name ? 'border-red-500' : ''}
                      />
                      {errors.vendor_name && <p className="text-red-500 text-sm mt-1">{errors.vendor_name}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recurring Issues */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => handleInputChange('is_recurring', checked)}
                />
                <Label htmlFor="is_recurring">This is a recurring issue</Label>
              </div>

              {formData.is_recurring && (
                <div>
                  <Label htmlFor="recurring_frequency">How often does this occur?</Label>
                  <Select value={formData.recurring_frequency} onValueChange={(value) => handleInputChange('recurring_frequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* File Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
              
              <div>
                <Label htmlFor="attachments">Screenshots, Documents, or Files</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('attachments').click()}
                    className="flex items-center gap-2"
                  >
                    <PaperClipIcon className="w-4 h-4" />
                    Add Files
                  </Button>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify_email"
                    checked={formData.notification_preferences.email}
                    onCheckedChange={(checked) => handleNestedChange('notification_preferences', 'email', checked)}
                  />
                  <Label htmlFor="notify_email">Email notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify_sms"
                    checked={formData.notification_preferences.sms}
                    onCheckedChange={(checked) => handleNestedChange('notification_preferences', 'sms', checked)}
                  />
                  <Label htmlFor="notify_sms">SMS notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify_in_app"
                    checked={formData.notification_preferences.in_app}
                    onCheckedChange={(checked) => handleNestedChange('notification_preferences', 'in_app', checked)}
                  />
                  <Label htmlFor="notify_in_app">In-app notifications</Label>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : (request ? 'Update Request' : 'Submit Request')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedRequestForm
