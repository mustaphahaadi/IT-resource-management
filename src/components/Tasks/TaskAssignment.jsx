import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { usePermissions } from "../../contexts/PermissionsContext"
import { apiService } from "../../services/api"
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"

const TaskAssignment = ({ onTaskUpdate }) => {
  const { hasPermission } = usePermissions()
  const [unassignedTasks, setUnassignedTasks] = useState([])
  const [availableTechnicians, setAvailableTechnicians] = useState([])
  const [supportRequests, setSupportRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedTechnician, setSelectedTechnician] = useState("")
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [newTaskData, setNewTaskData] = useState({
    request_id: "",
    title: "",
    description: "",
    priority: "medium",
    estimated_hours: "",
    auto_assign: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch unassigned tasks
      const tasksResponse = await apiService.getTasks({ status: 'pending' })
      if (tasksResponse?.data) {
        setUnassignedTasks(Array.isArray(tasksResponse.data) ? tasksResponse.data : tasksResponse.data.results || [])
      }

      // Fetch available technicians
      const techResponse = await apiService.getAvailablePersonnel()
      if (techResponse?.data) {
        setAvailableTechnicians(techResponse.data.available_technicians || [])
      }

      // Fetch support requests that don't have tasks yet
      const requestsResponse = await apiService.getSupportRequests({ status: 'open' })
      if (requestsResponse?.data) {
        const requests = Array.isArray(requestsResponse.data) ? requestsResponse.data : requestsResponse.data.results || []
        setSupportRequests(requests.filter(req => !req.has_tasks))
      }

    } catch (error) {
      console.error('Error fetching assignment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTask = async (task, technicianId) => {
    try {
      setAssignmentLoading(true)
      
      const response = await apiService.assignTask(task.id, technicianId)
      if (response?.data) {
        // Refresh data
        fetchData()
        if (onTaskUpdate) onTaskUpdate()
        setShowAssignDialog(false)
        setSelectedTask(null)
        setSelectedTechnician("")
      }
    } catch (error) {
      console.error('Error assigning task:', error)
    } finally {
      setAssignmentLoading(false)
    }
  }

  const handleCreateTask = async () => {
    try {
      setAssignmentLoading(true)
      
      const response = await apiService.createTaskFromRequest(newTaskData.request_id, {
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority,
        estimated_hours: newTaskData.estimated_hours ? parseFloat(newTaskData.estimated_hours) : null,
        auto_assign: newTaskData.auto_assign
      })
      
      if (response?.data) {
        // Reset form
        setNewTaskData({
          request_id: "",
          title: "",
          description: "",
          priority: "medium",
          estimated_hours: "",
          auto_assign: false
        })
        setShowCreateTaskDialog(false)
        fetchData()
        if (onTaskUpdate) onTaskUpdate()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setAssignmentLoading(false)
    }
  }

  const getAssignmentSuggestions = async (task) => {
    try {
      const response = await apiService.getAssignmentSuggestions(task.id)
      if (response?.data?.suggestions) {
        return response.data.suggestions
      }
    } catch (error) {
      console.error('Error getting assignment suggestions:', error)
    }
    return []
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getWorkloadColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-orange-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (!hasPermission('tasks.assign')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">You don't have permission to assign tasks.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Assignment</h2>
          <p className="text-gray-600">Assign tasks to available technicians</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Task from Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="request">Support Request</Label>
                  <Select value={newTaskData.request_id} onValueChange={(value) => {
                    setNewTaskData(prev => ({ ...prev, request_id: value }))
                    // Auto-fill title and description from request
                    const request = supportRequests.find(r => r.id.toString() === value)
                    if (request) {
                      setNewTaskData(prev => ({
                        ...prev,
                        title: `Support Request: ${request.title}`,
                        description: request.description,
                        priority: request.priority
                      }))
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a support request" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportRequests.map((request) => (
                        <SelectItem key={request.id} value={request.id.toString()}>
                          {request.ticket_number} - {request.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTaskData.title}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTaskData.description}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTaskData.priority} onValueChange={(value) => setNewTaskData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hours">Estimated Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      value={newTaskData.estimated_hours}
                      onChange={(e) => setNewTaskData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_assign"
                    checked={newTaskData.auto_assign}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, auto_assign: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="auto_assign" className="text-sm">
                    Auto-assign to best available technician
                  </Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask}
                    disabled={!newTaskData.request_id || !newTaskData.title || assignmentLoading}
                  >
                    {assignmentLoading ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Unassigned Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Unassigned Tasks</span>
                <Badge variant="secondary">{unassignedTasks.length} tasks</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : unassignedTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No unassigned tasks</p>
                  <p className="text-sm">All tasks have been assigned to technicians.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {unassignedTasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          
                          {(task.request_ticket || task.request_title) && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              <span>Request: {task.request_ticket}</span>
                              {task.request_title && (
                                <span>• {task.request_title}</span>
                              )}
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created {formatTimeAgo(task.created_at)}</span>
                            {task.estimated_hours && (
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {task.estimated_hours}h estimated
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Dialog open={showAssignDialog && selectedTask?.id === task.id} onOpenChange={(open) => {
                            setShowAssignDialog(open)
                            if (!open) {
                              setSelectedTask(null)
                              setSelectedTechnician("")
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedTask(task)}
                                className="flex items-center gap-1"
                              >
                                <UserIcon className="w-3 h-3" />
                                Assign
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Assign Task</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">{task.title}</h4>
                                  <p className="text-sm text-gray-600">{task.description}</p>
                                </div>
                                
                                <div>
                                  <Label>Select Technician</Label>
                                  <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a technician" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableTechnicians.map((tech) => (
                                        <SelectItem key={tech.id} value={tech.id.toString()}>
                                          <div className="flex items-center justify-between w-full">
                                            <span>{tech.user.first_name} {tech.user.last_name}</span>
                                            <div className="flex items-center gap-2 ml-2">
                                              <Badge variant="outline" className="text-xs">
                                                {tech.skill_level}
                                              </Badge>
                                              <span className={`text-xs ${getWorkloadColor(tech.workload.utilization_percentage)}`}>
                                                {Math.round(tech.workload.utilization_percentage)}%
                                              </span>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleAssignTask(task, selectedTechnician)}
                                    disabled={!selectedTechnician || assignmentLoading}
                                  >
                                    {assignmentLoading ? 'Assigning...' : 'Assign Task'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Technicians */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5" />
                Available Technicians
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {availableTechnicians.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No available technicians</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {availableTechnicians.map((tech) => (
                    <div key={tech.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900">
                            {tech.user.first_name} {tech.user.last_name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1">
                            {tech.department} • {tech.skill_level}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {tech.workload.current_tasks}/{tech.workload.max_tasks} tasks
                            </Badge>
                            <span className={`text-xs font-medium ${getWorkloadColor(tech.workload.utilization_percentage)}`}>
                              {Math.round(tech.workload.utilization_percentage)}%
                            </span>
                          </div>
                          
                          {tech.workload.critical_tasks > 0 && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              {tech.workload.critical_tasks} critical tasks
                            </div>
                          )}
                          
                          {tech.specializations && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <CpuChipIcon className="w-3 h-3" />
                              <span className="truncate">{tech.specializations}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TaskAssignment
