import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Button } from '../ui/button';
import { NativeSelect } from '../ui/native-select';
import AsyncSelect from '../ui/AsyncSelect';
import UserSelect from '../ui/user-select';
import StatusBadge from '../ui/status-badge';
import { XMarkIcon, PencilIcon, ArrowUpOnSquareIcon, TicketIcon } from '@heroicons/react/24/outline';

const RequestDetailsSidebar = ({ request, onClose, onUpdate, onAssign }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (request) {
      fetchComments();
    }
  }, [request]);

  const fetchComments = async () => {
    try {
      const response = await apiService.getRequestComments(request.id);
      setComments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await apiService.addRequestComment(request.id, newComment.trim());
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await apiService.updateSupportRequest(request.id, { status });
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ease-in-out ${request ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-white border-l border-border shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${request ? 'translate-x-0' : 'translate-x-full'}`}>
        {request && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">{request.ticket_number}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <XMarkIcon className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{request.title}</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={request.priority} type="priority" />
                    <StatusBadge status={request.status} type="request" />
                  </div>
                </div>
                {hasPermission('requests.update') && (
                  <Button variant="outline" onClick={() => { /* Implement edit functionality */ }}>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{request.description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Details</h4>
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requester:</span>
                      <span>{request.requester_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department:</span>
                      <span>{request.department_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{request.category_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(request.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(request.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/50 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Actions</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    {hasPermission('requests.assign') ? (
                      <UserSelect
                        name="assigned_to"
                        value={request.assigned_to ? String(request.assigned_to) : ''}
                        onChange={(e) => onAssign(request.id, e.target.value)}
                        userType="personnel"
                        placeholder="Unassigned"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                        {request.assigned_to_name || 'Unassigned'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                    {hasPermission('requests.update') ? (
                      <AsyncSelect
                        value={request.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        options={[
                          { value: 'open', label: 'Open' },
                          { value: 'assigned', label: 'Assigned' },
                          { value: 'in_progress', label: 'In Progress' },
                          { value: 'pending', label: 'Pending' },
                          { value: 'resolved', label: 'Resolved' },
                          { value: 'closed', label: 'Closed' },
                        ]}
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                        {request.status?.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Comments</h4>
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border border-border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">{comment.comment}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 bg-white border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit">
                    <ArrowUpOnSquareIcon className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RequestDetailsSidebar;
