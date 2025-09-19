import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline"
import { apiService } from "../../services/api"

const RequestDetails = ({ request, onClose, onUpdate, onAssign }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [personnel, setPersonnel] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
    fetchPersonnel()
  }, [request.id])

  const fetchComments = async () => {
    try {
      const response = await apiService.get(`/requests/support-requests/${request.id}/`)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const fetchPersonnel = async () => {
    try {
      const response = await apiService.getAvailablePersonnel()
      setPersonnel(response.data)
    } catch (error) {
      console.error("Error fetching personnel:", error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      await apiService.addRequestComment(request.id, newComment, isInternal)
      setNewComment("")
      setIsInternal(false)
      fetchComments()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (personnelId) => {
    try {
      await onAssign(request.id, personnelId)
      onUpdate()
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>{request.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Ticket: {request.ticket_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                request.priority,
              )}`}
            >
              {request.priority} priority
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                request.status,
              )}`}
            >
              {request.status.replace("_", " ")}
            </span>
          </div>

          {/* Request Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{request.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-gray-900">{request.category_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Channel</p>
                  <p className="text-gray-900">{request.channel}</p>
                </div>
                {request.equipment_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Related Equipment</p>
                    <p className="text-gray-900">{request.equipment_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requester Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{request.requester_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-gray-900">{request.requester_department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-gray-900">{request.requester_location}</p>
                </div>
                {request.requester_phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">{request.requester_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {request.assigned_to_name ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">Assigned to {request.assigned_to_name}</span>
                  </div>
                  <select
                    onChange={(e) => e.target.value && handleAssign(e.target.value)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                  >
                    <option value="">Reassign to...</option>
                    {personnel.map((person) => (
                      <option key={person.id} value={person.user.id}>
                        {person.user_name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-muted-foreground">Unassigned</span>
                  <select
                    onChange={(e) => e.target.value && handleAssign(e.target.value)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                  >
                    <option value="">Assign to...</option>
                    {personnel.map((person) => (
                      <option key={person.id} value={person.user.id}>
                        {person.user_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-gray-900">{new Date(request.created_at).toLocaleString()}</p>
              </div>
              {request.assigned_at && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned</p>
                  <p className="text-gray-900">{new Date(request.assigned_at).toLocaleString()}</p>
                </div>
              )}
              {request.resolved_at && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Resolved</p>
                  <p className="text-gray-900">{new Date(request.resolved_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span>Comments ({comments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-gray-700">Internal comment</span>
                  </label>
                  <Button type="submit" disabled={loading || !newComment.trim()}>
                    {loading ? "Adding..." : "Add Comment"}
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.is_internal ? "bg-accent/10 border border-accent/20" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{comment.author_name}</span>
                        {comment.is_internal && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Internal</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

export default RequestDetails
