import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { usePermissions } from "../contexts/PermissionsContext"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  UserIcon,
  BellIcon,
  CheckCircleIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentListIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"
import { apiService } from "../services/api";
import DataTable from "../components/ui/data-table";
import RequestDetailsSidebar from "../components/Requests/RequestDetailsSidebar";
import AlertsPanel from "../components/Requests/AlertsPanel"
import RequestForm from "../components/Requests/RequestForm"
import RequestFilters from "../components/Requests/RequestFilters"

const Requests = () => {
  const { hasPermission } = usePermissions()
  const [requests, setRequests] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
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
      setShowForm(false)
      return
    }

    // default close
    setShowForm(false)
    setSelectedRequest(null)
  }, [location.pathname, requestId, requests])

  const fetchRequests = async () => {
    try {
      setLoading(true)

      const params = { ...filters }
      if (searchTerm) params.search = searchTerm
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] === null || params[k] === undefined) delete params[k]
      })

      const wantsUnassigned = filters.assigned_to === "unassigned"
      if (wantsUnassigned) delete params.assigned_to

      const res = await apiService.getSupportRequests(params)
      let items = res.data?.results || res.data || []
      if (wantsUnassigned) {
        items = items.filter((r) => !r.assigned_to)
      }
      setRequests(items)
    } catch (error) {
      console.error("Error fetching requests:", error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const res = await apiService.getAlerts({ is_acknowledged: false })
      setAlerts(res.data?.results || res.data || [])
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

  const handleResolveRequest = async (requestId) => {
    if (window.confirm('Mark this request as resolved?')) {
      try {
        await apiService.updateSupportRequest(requestId, { status: 'resolved' })
        fetchRequests()
      } catch (error) {
        console.error("Error resolving request:", error)
      }
    }
  }

  const handleEditRequest = (request) => {
    navigate(`${getBasePath()}/${request.id}/edit`)
  }

  const handleViewTasks = (request) => {
    const tasksPath = location.pathname.startsWith("/app/") ? "/app/tasks" : "/tasks";
    navigate(`${tasksPath}?request=${request.id}`);
  }

  const handleAddComment = (request) => {
    // Open the request details sidebar which has comment functionality
    navigate(`${getBasePath()}/${request.id}`);
  }

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Cancel this request?')) {
      try {
        await apiService.updateSupportRequest(requestId, { status: 'cancelled' });
        fetchRequests();
      } catch (error) {
        console.error("Error cancelling request:", error);
      }
    }
  }

  const columns = [
    { 
      key: "ticket_number", 
      title: "Ticket", 
      sortable: true, 
      render: (value) => {
        const sanitized = String(value || '').replace(/[<>"'&]/g, '')
        return <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{sanitized}</code>
      }
    },
    { key: "title", title: "Title", sortable: true },
    { 
      key: "priority", 
      title: "Priority", 
      sortable: true, 
      type: "status", 
      statusType: "priority" 
    },
    { 
      key: "status", 
      title: "Status", 
      sortable: true, 
      type: "status", 
      statusType: "request" 
    },
    { key: "requester_name", title: "Requester", sortable: true },
    { key: "assigned_to_name", title: "Assignee", sortable: true },
    { key: "created_at", title: "Created", sortable: true, type: "datetime" },
    {
      key: "actions",
      title: "Actions",
      sortable: false,
      render: (value, request) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleViewRequest(request)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasPermission('requests.update') && (
            <button
              onClick={() => handleEditRequest(request)}
              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {hasPermission('requests.assign') && !request.assigned_to && (
            <button
              onClick={() => navigate('/assignment')}
              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Assign"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}
          {hasPermission('requests.update') && request.status !== 'resolved' && request.status !== 'closed' && (
            <button
              onClick={() => handleResolveRequest(request.id)}
              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Mark Resolved"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleAddComment(request)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Add Comment"
          >
            <ChatBubbleLeftIcon className="w-4 h-4" />
          </button>
          {request.has_tasks && (
            <button
              onClick={() => handleViewTasks(request)}
              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="View Related Tasks"
            >
              <ClipboardDocumentListIcon className="w-4 h-4" />
            </button>
          )}
          {hasPermission('requests.update') && request.status !== 'cancelled' && request.status !== 'closed' && request.status !== 'resolved' && (
            <button
              onClick={() => handleCancelRequest(request.id)}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Cancel Request"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
  ];

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
                placeholder="Search requests..."
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

      <DataTable
        data={requests}
        columns={columns}
        loading={loading}
        onRowClick={handleViewRequest}
        emptyMessage="No support requests found. Try adjusting your filters or create a new request."
      />

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          request={selectedRequest}
          onClose={() => navigate(getBasePath())}
          onSuccess={handleFormSuccess}
        />
      )}

      {selectedRequest && !showForm && (
        <RequestDetailsSidebar
          request={selectedRequest}
          onClose={() => navigate(getBasePath())}
          onUpdate={fetchRequests}
          onAssign={handleAssignRequest}
          onEdit={() => handleEditRequest(selectedRequest)}
        />
      )}

      {/* Alerts Panel */}
      {showAlerts && <AlertsPanel alerts={alerts} onClose={() => setShowAlerts(false)} onUpdate={fetchAlerts} />}
    </div>
  )
}

export default Requests
