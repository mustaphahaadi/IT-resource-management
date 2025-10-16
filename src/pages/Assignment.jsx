import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Separator } from "../components/ui/separator"
import { apiService } from "../services/api"
import StatusBadge from "../components/ui/status-badge"

const Assignment = () => {
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [selectedRequestId, setSelectedRequestId] = useState("")

  const [assignableUsers, setAssignableUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [roleFilter, setRoleFilter] = useState("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      const res = await apiService.getSupportRequests({ status: "pending" })
      // API may be paginated; handle both list and paginated formats
      const list = res.data?.results || res.data || []
      setRequests(Array.isArray(list) ? list : [])
      // Auto-select first pending request for convenience
      if (!selectedRequestId && list.length) {
        setSelectedRequestId(String(list[0].id))
      }
    } catch (e) {
      setError("Failed to load pending tickets")
    } finally {
      setLoadingRequests(false)
    }
  }



  const fetchAssignableUsers = async () => {
    try {
      setLoadingUsers(true)
      setError("")
      const res = await apiService.getAssignableUsers()
      const list = res.data?.results || []
      // Filter by role if specified (skip filter if 'all' is selected)
      const filtered = (roleFilter && roleFilter !== 'all') ? list.filter(u => u.role === roleFilter) : list
      setAssignableUsers(filtered)
    } catch (e) {
      setError("Failed to load assignable users")
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])
  useEffect(() => { fetchAssignableUsers() }, [roleFilter])

  const handleAssign = async (userId) => {
    if (!selectedRequestId) return
    setError("")
    setSuccess("")
    try {
      await apiService.assignSupportRequest(selectedRequestId, userId)
      setSuccess("Ticket assigned successfully")
      // Refresh requests
      await fetchRequests()
      setSelectedRequestId("")
    } catch (e) {
      const msg = e?.response?.data?.error || "Failed to assign ticket"
      setError(msg)
    }
  }

  const selectedRequest = useMemo(() => {
    return requests.find(r => String(r.id) === String(selectedRequestId))
  }, [requests, selectedRequestId])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Select Pending Ticket</Label>
              <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingRequests ? "Loading tickets..." : "Select a pending ticket"} />
                </SelectTrigger>
                <SelectContent>
                  {(requests || []).map(r => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.ticket_number} - {r.title} ({r.priority})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="secondary" onClick={() => fetchRequests()} disabled={loadingRequests}>
                {loadingRequests ? "Refreshing..." : "Refresh Tickets"}
              </Button>
            </div>
          </div>

          {selectedRequest && (
            <div className="text-sm text-gray-600">
              <div className="flex flex-wrap gap-3 items-center">
                <span>Selected:</span>
                <span className="font-medium">{selectedRequest.ticket_number} - {selectedRequest.title}</span>
                <StatusBadge status={selectedRequest.priority} />
                <StatusBadge status={selectedRequest.status} />
                <span className="text-gray-500">Requester: {selectedRequest.requester_name || 'N/A'}</span>
                <span className="text-gray-500">Dept: {selectedRequest.requester_department}</span>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Available Technicians & Staff</h3>
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="senior_technician">Senior Technician</SelectItem>
                    <SelectItem value="it_manager">IT Manager</SelectItem>
                    <SelectItem value="system_admin">System Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingUsers && <p className="text-sm text-gray-500">Loading assignable users...</p>}
            {!loadingUsers && assignableUsers.length === 0 && (
              <p className="text-sm text-gray-500">No assignable users found.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignableUsers.map(u => (
                <div key={u.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.first_name} {u.last_name}</div>
                    <div className="text-xs text-gray-500">Email: {u.email}</div>
                    <div className="text-xs text-gray-500">
                      <StatusBadge status={u.role} /> • Dept: {u.department || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleAssign(u.id)} disabled={!selectedRequestId}>Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Assignment
