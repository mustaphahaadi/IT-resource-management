import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { usePermissions, getRoleDisplayName } from '../contexts/PermissionsContext'
import { apiService } from '../services/api'
import {
  ComputerDesktopIcon,
  WifiIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  EnvelopeIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const ITRequestForm = ({ onSubmit, onCancel, initialData = null }) => {
  const navigate = useNavigate()
  const { user, userRole } = usePermissions()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    urgency: 'medium',
    impact: 'medium',
    requester_phone: user?.phone_number || '',
    requester_location: '',
    business_justification: '',
    channel: 'web_portal',
    ...initialData
  })
  
  const [categories, setCategories] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // IT Support Categories with icons and descriptions
  const categoryTypes = [
    {
      id: 'hardware',
      name: 'Hardware Issues',
      icon: ComputerDesktopIcon,
      description: 'Computer, printer, monitor, or other hardware problems',
      examples: 'Computer won\'t start, printer not working, monitor issues'
    },
    {
      id: 'software',
      name: 'Software Issues',
      icon: WrenchScrewdriverIcon,
      description: 'Application errors, software installation, or licensing',
      examples: 'Application crashes, software installation, license issues'
    },
    {
      id: 'network',
      name: 'Network & Connectivity',
      icon: WifiIcon,
      description: 'Internet, WiFi, VPN, or network connectivity problems',
      examples: 'No internet access, WiFi problems, VPN connection issues'
    },
    {
      id: 'access',
      name: 'Access & Permissions',
      icon: KeyIcon,
      description: 'Account access, password resets, or permission requests',
      examples: 'Password reset, account locked, need access to system/folder'
    },
    {
      id: 'email',
      name: 'Email & Communication',
      icon: EnvelopeIcon,
      description: 'Email problems, setup, or communication tools',
      examples: 'Email not working, setup new email, Teams/Zoom issues'
    },
    {
      id: 'security',
      name: 'Security Issues',
      icon: ShieldCheckIcon,
      description: 'Security concerns, suspicious activity, or malware',
      examples: 'Suspicious email, potential virus, security incident'
    },
    {
      id: 'training',
      name: 'Training & Support',
      icon: AcademicCapIcon,
      description: 'How-to questions, training requests, or user guidance',
      examples: 'How to use software, training request, general IT questions'
    }
  ]

  const priorityLevels = [
    {
      value: 'critical',
      label: 'Critical',
      description: 'System down, security breach, or business-stopping issue',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    },
    {
      value: 'high',
      label: 'High',
      description: 'Major impact on operations or multiple users affected',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Standard request with moderate impact',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      value: 'low',
      label: 'Low',
      description: 'Enhancement or non-urgent request',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 border-gray-200'
    }
  ]

  useEffect(() => {
    fetchCategories()
    fetchEquipment()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiService.getRequestCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchEquipment = async () => {
    try {
      const response = await apiService.getEquipment()
      setEquipment(response.data?.results || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear any previous errors
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please provide a title for your request')
      return false
    }
    if (!formData.description.trim()) {
      setError('Please describe the issue or request')
      return false
    }
    if (!formData.category) {
      setError('Please select a category')
      return false
    }
    if (!formData.requester_location.trim()) {
      setError('Please provide your location')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')
    
    try {
      const requestData = {
        ...formData,
        requester: user.id,
        requester_department: user.department,
        status: 'open'
      }
      
      const response = await apiService.createSupportRequest(requestData)
      
      setSuccess(`Request submitted successfully! Ticket #${response.data.ticket_number}`)
      
      if (onSubmit) {
        onSubmit(response.data)
      } else {
        // Redirect to requests page after 2 seconds
        setTimeout(() => {
          navigate('/app/requests')
        }, 2000)
      }
      
    } catch (error) {
      console.error('Error submitting request:', error)
      setError(error.response?.data?.message || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategoryType = categoryTypes.find(cat => cat.id === formData.category)
  const selectedPriority = priorityLevels.find(p => p.value === formData.priority)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Submit IT Support Request</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Describe your IT issue or request. Our support team will respond according to the priority level.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <InformationCircleIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What type of support do you need?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTypes.map((category) => {
                const Icon = category.icon
                const isSelected = formData.category === category.id
                
                return (
                  <div
                    key={category.id}
                    className={`
                      p-4 border rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleInputChange('category', category.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {category.name}
                        </h3>
                        <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {category.description}
                        </p>
                        <p className={`text-xs mt-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                          Examples: {category.examples}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue (e.g., 'Computer won't start')"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about the issue, including:
• What were you trying to do?
• What happened instead?
• Any error messages you saw
• Steps you've already tried"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Your Location *</Label>
                <Input
                  id="location"
                  placeholder="Building, floor, room number"
                  value={formData.requester_location}
                  onChange={(e) => handleInputChange('requester_location', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  placeholder="Phone number for urgent contact"
                  value={formData.requester_phone}
                  onChange={(e) => handleInputChange('requester_phone', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Level</CardTitle>
            <p className="text-sm text-gray-600">
              Select the priority based on how urgently you need this resolved
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityLevels.map((priority) => (
                <div
                  key={priority.value}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${formData.priority === priority.value 
                      ? `${priority.bgColor} ring-2 ring-opacity-50` 
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => handleInputChange('priority', priority.value)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={formData.priority === priority.value}
                      onChange={() => handleInputChange('priority', priority.value)}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {priority.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Justification (for non-critical requests) */}
        {formData.priority !== 'critical' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Impact (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="How does this issue impact your work or the business? This helps us prioritize and allocate resources appropriately."
                value={formData.business_justification}
                onChange={(e) => handleInputChange('business_justification', e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Submitting as: <strong>{user?.first_name} {user?.last_name}</strong></p>
                <p>Role: <strong>{getRoleDisplayName(userRole)}</strong></p>
                <p>Department: <strong>{user?.department?.charAt(0).toUpperCase() + user?.department?.slice(1)}</strong></p>
              </div>
              
              <div className="flex space-x-3">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default ITRequestForm
