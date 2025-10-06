import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { usePermissions } from "../../contexts/PermissionsContext";
import { Button } from "../ui/button";
import { NativeSelect } from "../ui/native-select";
import UserSelect from "../ui/user-select";
import StatusBadge from "../ui/status-badge";
import { XMarkIcon, PencilIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";

const TaskDetailsSidebar = ({ task, personnel, onClose, onEdit, onAssign, onStatusUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (task) {
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    try {
      const response = await apiService.getTaskComments(task.id);
      setComments(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await apiService.addTaskComment(task.id, newComment.trim());
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ease-in-out ${task ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-white border-l border-border shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${task ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Task Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.priority} type="priority" />
                <StatusBadge status={task.status} type="task" />
              </div>
            </div>
            <div className="flex gap-2">
              {hasPermission("tasks.update") && (
                <Button variant="outline" onClick={onEdit}>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground">{task.description || "No description provided"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-accent/50 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Details</h4>
              <div className="text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span>{task.assigned_to_name || "Unassigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request:</span>
                  <span>{task.request_ticket ? `${task.request_ticket} - ${task.request_title}` : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated:</span>
                  <span>{task.estimated_hours || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual:</span>
                  <span>{task.actual_hours || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{task.created_at ? new Date(task.created_at).toLocaleString() : ""}</span>
                </div>
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Actions</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reassign Task</label>
                {hasPermission('tasks.assign') ? (
                  <UserSelect
                    name="assigned_to"
                    value={task.assigned_to ? String(task.assigned_to) : ""}
                    onChange={(e) => onAssign(task.id, e.target.value)}
                    userType="personnel"
                    placeholder="Unassigned"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                    {task.assigned_to_name || "Unassigned"}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                {hasPermission('tasks.update') ? (
                  <NativeSelect
                    value={task.status}
                    onChange={(e) => onStatusUpdate(task.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </NativeSelect>
                ) : (
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                    {task.status?.replace("_", " ")}
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
    </div>
    </>
  );
};


export default TaskDetailsSidebar;
