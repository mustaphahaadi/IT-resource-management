import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { usePermissions } from "../contexts/PermissionsContext";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { apiService } from "../services/api";
import TaskForm from "../components/Tasks/TaskForm";
import PersonnelPanel from "../components/Tasks/PersonnelPanel";
import TaskDetailsSidebar from "../components/Tasks/TaskDetailsSidebar";
import DataTable from "../components/ui/data-table";
import TaskFilters from "../components/Tasks/TaskFilters";
import PageHeader from "../components/common/PageHeader";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPersonnelPanel, setShowPersonnelPanel] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    search: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const { hasPermission } = usePermissions();

  const getBasePath = () => (location.pathname.startsWith("/app/") ? "/app/tasks" : "/tasks");

  useEffect(() => {
    fetchTasks();
    fetchPersonnel();
  }, [filters]);

  useEffect(() => {
    const openNew = location.pathname.endsWith("/new");
    const openEdit = location.pathname.endsWith("/edit");

    if (openNew) {
      setSelectedTask(null);
      setShowTaskForm(true);
      return;
    }

    if (taskId && openEdit) {
      const existing = tasks.find((t) => t.id?.toString() === taskId);
      if (existing) {
        setSelectedTask(existing);
      } else {
        apiService.getTask(taskId).then((res) => setSelectedTask(res.data));
      }
      setShowTaskForm(true);
      return;
    }

    if (taskId) {
      const existing = tasks.find((t) => t.id?.toString() === taskId);
      if (existing) {
        setSelectedTask(existing);
      } else {
        apiService.getTask(taskId).then((res) => setSelectedTask(res.data));
      }
      setShowTaskForm(false);
      return;
    }

    setShowTaskForm(false);
    setSelectedTask(null);
  }, [location.pathname, taskId, tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      const res = await apiService.getTasks(params);
      const data = res.data.results || res.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const res = await apiService.getPersonnel({ page_size: 100 });
      const data = res.data.results || res.data;
      setPersonnel(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      setPersonnel([]);
    }
  };

  const handleManagePersonnel = () => setShowPersonnelPanel(true);
  const handleCreateTask = () => navigate(`${getBasePath()}/new`);

  const handleTaskSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        await apiService.updateTask(selectedTask.id, taskData);
      } else {
        await apiService.createTask(taskData);
      }
      await fetchTasks();
      navigate(getBasePath());
      setShowTaskForm(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const columns = [
    { key: "title", title: "Title", sortable: true },
    { key: "priority", title: "Priority", sortable: true, type: "status", statusType: "priority" },
    { key: "status", title: "Status", sortable: true, type: "status", statusType: "task" },
    { key: "assigned_to_name", title: "Assignee", sortable: true },
    { key: "due_date", title: "Due Date", sortable: true, type: "date" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Management"
        description="Assign and track IT tasks and workflows"
        actions={[
          hasPermission("tasks.assign") && (
            <Button
              key="manage-personnel"
              onClick={handleManagePersonnel}
              variant="outline"
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Manage Personnel
            </Button>
          ),
          hasPermission("tasks.create") && (
            <Button key="create-task" onClick={handleCreateTask}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          ),
        ]}
      />

      <TaskFilters filters={filters} onFiltersChange={setFilters} personnel={personnel} />

      <DataTable
        data={tasks}
        columns={columns}
        loading={loading}
        onRowClick={(task) => navigate(`${getBasePath()}/${task.id}`)}
        emptyMessage="No tasks found. Try adjusting your filters or create a new task."
      />

      {showTaskForm && (
        <TaskForm
          task={selectedTask}
          personnel={personnel}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            navigate(getBasePath());
            setShowTaskForm(false);
            setSelectedTask(null);
          }}
        />
      )}

      {selectedTask && !showTaskForm && (
        <TaskDetailsSidebar
          task={selectedTask}
          personnel={personnel}
          onClose={() => navigate(getBasePath())}
          onEdit={() => navigate(`${getBasePath()}/${selectedTask?.id}/edit`)}
          onAssign={async (taskId, personnelId) => {
            await apiService.assignTask(taskId, personnelId);
            fetchTasks();
          }}
          onStatusUpdate={async (taskId, status) => {
            await apiService.updateTask(taskId, { status });
            fetchTasks();
          }}
        />
      )}

      {showPersonnelPanel && (
        <PersonnelPanel
          personnel={personnel}
          onClose={() => setShowPersonnelPanel(false)}
          onUpdate={async () => {
            await fetchPersonnel();
            await fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default Tasks;
