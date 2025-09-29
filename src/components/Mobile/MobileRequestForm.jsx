import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { usePermissions } from "../../contexts/PermissionsContext"
import { apiService } from "../../services/api"
import {
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  PhoneIcon,
  CameraIcon,
  MicrophoneIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"

const MobileRequestForm = ({ onClose, onSuccess }) => {
  const { user } = usePermissions()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    requester_location: '',
    related_equipment: '',
    urgency_reason: '',
    steps_taken: '',
    error_messages: '',
    attachments: [],
    voice_notes: []
  })
  
  const [categories, setCategories] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)

  const totalSteps = 4

  useEffect(() => {
    fetchFormData()
  }, [])

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = () => {
    const newErrors = {}

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required'
        }
        if (!formData.category) {
          newErrors.category = 'Category is required'
        }
        break
      case 2:
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required'
        }
        break
      case 3:
        if (!formData.requester_location.trim()) {
          newErrors.requester_location = 'Location is required'
        }
        break
      case 4:
        if (formData.priority === 'critical' && !formData.urgency_reason.trim()) {
          newErrors.urgency_reason = 'Urgency reason is required for critical priority'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePhotoCapture = (event) => {
    const files = Array.from(event.target.files)
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const audioFile = new File([blob], `voice_note_${Date.now()}.wav`, { type: 'audio/wav' })
        
        setFormData(prev => ({
          ...prev,
          voice_notes: [...prev.voice_notes, audioFile]
        }))
        
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting voice recording:', error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const removeAttachment = (index, type = 'attachments') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }

    setLoading(true)
    
    try {
      const submitData = {
        ...formData,
        related_equipment: formData.related_equipment || null,
        category: formData.category,
        requester_phone: user?.phone || '',
        requester_department: user?.department || '',
      }

      const response = await apiService.createSupportRequest(submitData)

      // Handle file uploads if any
      if (formData.attachments.length > 0 || formData.voice_notes.length > 0) {
        console.log('Files to upload:', {
          attachments: formData.attachments,
          voice_notes: formData.voice_notes
        })
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Tell us what you need help with</p>
            </div>

            <div>
              <Label htmlFor="title">What's the issue? *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the problem"
                className={`text-lg ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className={`text-lg ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="What type of issue is this?" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2 py-2">
                        <ComputerDesktopIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Details</h2>
              <p className="text-gray-600">Help us understand the problem better</p>
            </div>

            <div>
              <Label htmlFor="description">Describe the problem *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What exactly is happening? When did it start? What were you trying to do?"
                rows={6}
                className={`text-base ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="steps_taken">What have you tried?</Label>
              <Textarea
                id="steps_taken"
                value={formData.steps_taken}
                onChange={(e) => handleInputChange('steps_taken', e.target.value)}
                placeholder="List any troubleshooting steps you've already tried"
                rows={3}
                className="text-base"
              />
            </div>

            <div>
              <Label htmlFor="error_messages">Error messages</Label>
              <Textarea
                id="error_messages"
                value={formData.error_messages}
                onChange={(e) => handleInputChange('error_messages', e.target.value)}
                placeholder="Copy any error messages you've seen"
                rows={3}
                className="text-base"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Location & Equipment</h2>
              <p className="text-gray-600">Where are you and what equipment is involved?</p>
            </div>

            <div>
              <Label htmlFor="requester_location">Your location *</Label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="requester_location"
                  value={formData.requester_location}
                  onChange={(e) => handleInputChange('requester_location', e.target.value)}
                  placeholder="Building, floor, room number"
                  className={`pl-12 text-lg ${errors.requester_location ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.requester_location && <p className="text-red-500 text-sm mt-1">{errors.requester_location}</p>}
            </div>

            <div>
              <Label htmlFor="related_equipment">Related equipment (if any)</Label>
              <Select value={formData.related_equipment} onValueChange={(value) => handleInputChange('related_equipment', value)}>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="Select equipment if this issue is related to specific hardware" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      <div className="flex items-center gap-2 py-2">
                        <ComputerDesktopIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.asset_tag}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Photo/Voice capture */}
            <div className="space-y-3">
              <Label>Add photos or voice notes</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="file"
                    id="photo-capture"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-capture').click()}
                    className="w-full flex items-center gap-2 py-3"
                  >
                    <CameraIcon className="w-5 h-5" />
                    Take Photo
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`w-full flex items-center gap-2 py-3 ${isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                  {isRecording ? 'Stop Recording' : 'Voice Note'}
                </Button>
              </div>

              {/* Show attachments */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Photos:</p>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index, 'attachments')}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.voice_notes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Voice Notes:</p>
                  {formData.voice_notes.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index, 'voice_notes')}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Priority & Urgency</h2>
              <p className="text-gray-600">How urgent is this issue?</p>
            </div>

            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-3 py-2">
                      <Badge className={getPriorityColor('low')}>Low</Badge>
                      <div>
                        <div className="font-medium">Low Priority</div>
                        <div className="text-sm text-gray-500">Can wait, not urgent</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-3 py-2">
                      <Badge className={getPriorityColor('medium')}>Medium</Badge>
                      <div>
                        <div className="font-medium">Medium Priority</div>
                        <div className="text-sm text-gray-500">Standard request</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-3 py-2">
                      <Badge className={getPriorityColor('high')}>High</Badge>
                      <div>
                        <div className="font-medium">High Priority</div>
                        <div className="text-sm text-gray-500">Impacts my work</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-3 py-2">
                      <Badge className={getPriorityColor('critical')}>Critical</Badge>
                      <div>
                        <div className="font-medium">Critical Priority</div>
                        <div className="text-sm text-gray-500">Impacts patient care</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.priority === 'critical' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <Label htmlFor="urgency_reason">Why is this critical? *</Label>
                <Textarea
                  id="urgency_reason"
                  value={formData.urgency_reason}
                  onChange={(e) => handleInputChange('urgency_reason', e.target.value)}
                  placeholder="Explain why this requires immediate attention and how it impacts patient care or critical operations"
                  rows={4}
                  className={`text-base mt-2 ${errors.urgency_reason ? 'border-red-500' : ''}`}
                />
                {errors.urgency_reason && <p className="text-red-500 text-sm mt-1">{errors.urgency_reason}</p>}
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Request Summary</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Issue:</span> {formData.title}</div>
                <div><span className="font-medium">Category:</span> {categories.find(c => c.id.toString() === formData.category)?.name || 'Not selected'}</div>
                <div><span className="font-medium">Priority:</span> <Badge className={getPriorityColor(formData.priority)}>{formData.priority}</Badge></div>
                <div><span className="font-medium">Location:</span> {formData.requester_location}</div>
                {formData.attachments.length > 0 && (
                  <div><span className="font-medium">Attachments:</span> {formData.attachments.length} photo(s)</div>
                )}
                {formData.voice_notes.length > 0 && (
                  <div><span className="font-medium">Voice Notes:</span> {formData.voice_notes.length} recording(s)</div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XMarkIcon className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-semibold text-gray-900">New Support Request</h1>
          <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-gray-50">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderStep()}
        
        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t bg-white">
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileRequestForm
