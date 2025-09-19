import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../services/api"
import RequestDetails from "../components/Requests/RequestDetails"
import AlertsPanel from "../components/Requests/AlertsPanel"
import RequestForm from "../components/Requests/RequestForm"

const Requests = () => {
  const [requests, setRequests] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    assigned_to: "",
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { requestId } = useParams()

  const getBasePath = () => (location.pathname.startsWith("/app/") ? "/app/requests" : "/requests")

  useEffect(() => {
    fetchRequests()
    fetchAlerts()
  }, [filters, searchTerm])

  useEffect(() => {
    const openNew = location.pathname.endsWith("/new")
    const openEdit = location.pathname.endsWith("/edit")

    if (openNew) {
      setSelectedRequest(null)
      setShowForm(true)
      setShowDetails(false)
      return
    }

    if (requestId && openEdit) {
      const existing = requests.find((r) => r.id?.toString() === requestId)
      if (existing) {
        setSelectedRequest(existing)
      } else {
        apiService
          .getSupportRequest(requestId)
          .then((res) => setSelectedRequest(res.data))
          .catch(() => {})
      }
      setShowForm(true)
      setShowDetails(false)
      return
    }

    if (requestId) {
      const existing = requests.find((r) => r.id?.toString() === requestId)
      if (existing) {
        setSelectedRequest(existing)
      } else {
        apiService
          .getSupportRequest(requestId)
          .then((res) => setSelectedRequest(res.data))
          .catch(() => {})
      }
      setShowDetails(true)
      setShowForm(false)
      return
    }

    // default close
    setShowForm(false)
    setShowDetails(false)
    setSelectedRequest(null)
  }, [location.pathname, requestId, requests])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock requests data
      const mockRequests = [
        {
          id: 1,
          ticket_number: 'REQ-2024-001',
          title: 'Network connectivity issue in ICU',
          description: 'Intermittent network connectivity issues affecting patient monitoring systems in ICU Room 302. Requires immediate attention as it impacts critical patient care.',
          status: 'open',
          priority: 'critical',
          category: 'Network',
          category_name: 'Network & Connectivity',
          requester: 'Dr. Sarah Wilson',
          requester_email: 'sarah.wilson@hospital.com',
          department: 'ICU',
          assigned_to: 'John Smith',
          assigned_to_id: 1,
          created_at: '2024-01-15T08:30:00Z',
          updated_at: '2024-01-15T10:15:00Z',
          due_date: '2024-01-16T08:30:00Z',
          resolution_notes: null,
          estimated_hours: 4,
          actual_hours: null
        },
        {
          id: 2,
          ticket_number: 'REQ-2024-002',
          title: 'Printer not working in Pharmacy',
          description: 'Main prescription printer in pharmacy is not responding. Staff unable to print medication labels.',
          status: 'in_progress',
          priority: 'high',
          category: 'Hardware',
          category_name: 'Hardware Issues',
          requester: 'Mike Johnson',
          requester_email: 'mike.johnson@hospital.com',
          department: 'Pharmacy',
          assigned_to: 'Sarah Davis',
          assigned_to_id: 2,
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-15T09:45:00Z',
          due_date: '2024-01-17T14:20:00Z',
          resolution_notes: 'Ordered replacement toner cartridge',
          estimated_hours: 2,
          actual_hours: 1.5
        },
        {
          id: 3,
          ticket_number: 'REQ-2024-003',
          title: 'Software update for MRI system',
          description: 'Scheduled software update for MRI scanner to latest version. Includes security patches and performance improvements.',
          status: 'resolved',
          priority: 'medium',
          category: 'Software',
          category_name: 'Software Updates',
          requester: 'Dr. Emily Chen',
          requester_email: 'emily.chen@hospital.com',
          department: 'Radiology',
          assigned_to: 'Mike Davis',
          assigned_to_id: 3,
          created_at: '2024-01-12T11:00:00Z',
          updated_at: '2024-01-14T16:30:00Z',
          due_date: '2024-01-20T11:00:00Z',
          resolution_notes: 'Software successfully updated during maintenance window. All systems tested and functioning normally.',
          estimated_hours: 6,
          actual_hours: 5.5
        },
        {
          id: 4,
          ticket_number: 'REQ-2024-004',
          title: 'New user account setup',
          description: 'Create new user accounts for 3 new nurses starting in Emergency Department. Include access to EMR system and department-specific applications.',
          status: 'pending',
          priority: 'low',
          category: 'Access',
          category_name: 'User Access',
          requester: 'HR Department',
          requester_email: 'hr@hospital.com',
          department: 'Emergency',
          assigned_to: null,
          assigned_to_id: null,
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z',
          due_date: '2024-01-18T09:15:00Z',
          resolution_notes: null,
          estimated_hours: 3,
          actual_hours: null
        },
        {
          id: 5,
          ticket_number: 'REQ-2024-005',
          title: 'Email server maintenance',
          description: 'Scheduled maintenance for email server including security updates and performance optimization.',
          status: 'scheduled',
          priority: 'medium',
          category: 'Maintenance',
          category_name: 'System Maintenance',
          requester: 'IT Department',
          requester_email: 'it@hospital.com',
          department: 'IT',
          assigned_to: 'John Smith',
          assigned_to_id: 1,
          created_at: '2024-01-10T16:00:00Z',
          updated_at: '2024-01-12T10:30:00Z',
          due_date: '2024-01-19T02:00:00Z',
          resolution_notes: null,
          estimated_hours: 8,
          actual_hours: null
        }
      ]
      
      // Apply filters
      let filteredRequests = mockRequests
      
      if (searchTerm) {
        filteredRequests = filteredRequests.filter(req =>
          req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.department.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (filters.status) {
        filteredRequests = filteredRequests.filter(req => req.status === filters.status)
      }
      
      if (filters.priority) {
        filteredRequests = filteredRequests.filter(req => req.priority === filters.priority)
      }
      
      if (filters.category) {
        filteredRequests = filteredRequests.filter(req => req.category === filters.category)
      }
      
      if (filters.assigned_to) {
        filteredRequests = filteredRequests.filter(req => req.assigned_to_id?.toString() === filters.assigned_to)
      }
      
      setRequests(filteredRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      // Mock alerts data
      const mockAlerts = [
        {
          id: 1,
          type: 'critical',
          message: '3 critical requests overdue',
          count: 3,
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'warning',
          message: '5 requests approaching SLA deadline',
          count: 5,
          timestamp: new Date().toISOString()
        }
      ]
      
      setAlerts(mockAlerts)
    } catch (error) {
      console.error("Error fetching alerts:", error)
      setAlerts([])
    }
  }

  const handleCreateRequest = () => {
    navigate(`${getBasePath()}/new`)
  }

  const handleViewRequest = (request) => {
    navigate(`${getBasePath()}/${request.id}`)
  }

  const handleFormSuccess = () => {
    navigate(getBasePath())
    setSelectedRequest(null)
    fetchRequests()
  }

  const handleAssignRequest = async (requestId, assignedTo) => {
    try {
      await apiService.assignRequest(requestId, assignedTo)
      fetchRequests()
    } catch (error) {
      console.error("Error assigning request:", error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-destructive bg-destructive/10 border-destructive/20"
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-200"
      case "medium":
        return "text-accent bg-accent/10 border-accent/20"
      case "low":
        return "text-muted-foreground bg-muted border-border"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-destructive bg-destructive/10"
      case "assigned":
        return "text-accent bg-accent/10"
      case "in_progress":
        return "text-primary bg-primary/10"
      case "pending":
        return "text-orange-600 bg-orange-100"
      case "resolved":
        return "text-green-600 bg-green-100"
      case "closed":
        return "text-muted-foreground bg-muted"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Requests</h1>
          <p className="text-muted-foreground">Manage IT support requests and alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowAlerts(true)} className="flex items-center space-x-2">
            <BellIcon className="w-4 h-4" />
            <span>Alerts</span>
            {alerts.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                {alerts.length}
              </span>
            )}
          </Button>
          <Button onClick={handleCreateRequest} className="flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>New Request</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search requests by ticket number, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <RequestFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>Support Requests ({requests.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support requests found</p>
              <Button onClick={handleCreateRequest} className="mt-4">
                Create First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    request.priority === "critical" ? "border-destructive/30 bg-destructive/5" : "border-border"
                  }`}
                  onClick={() => handleViewRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{request.ticket_number}</code>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            request.priority,
                          )}`}
                        >
                          {request.priority}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          {request.status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-foreground mb-2">{request.title}</h3>

                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{request.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{request.requester_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{getTimeAgo(request.created_at)}</span>
                        </div>
                        {request.assigned_to_name && (
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-4 h-4" />
                            <span>Assigned to {request.assigned_to_name}</span>
                          </div>
                        )}
                        {request.comments && request.comments.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            <span>{request.comments.length} comments</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewRequest(request)
                        }}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          request={selectedRequest}
          onClose={() => navigate(getBasePath())}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => navigate(getBasePath())}
          onUpdate={fetchRequests}
          onAssign={handleAssignRequest}
        />
      )}

      {/* Alerts Panel */}
      {showAlerts && <AlertsPanel alerts={alerts} onClose={() => setShowAlerts(false)} onUpdate={fetchAlerts} />}
    </div>
  )
}

export default Requests
