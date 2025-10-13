import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "../ui/input";
import { NativeSelect } from "../ui/native-select";
import AsyncSelect from "../ui/AsyncSelect"
import { Button } from "../ui/button";

const TaskFilters = ({ filters, onFiltersChange, personnel }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "",
      priority: "",
      assignee: "",
      search: "",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        <AsyncSelect
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'on_hold', label: 'On Hold' },
          ]}
          className=""
        />

        <AsyncSelect
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          options={[
            { value: '', label: 'All Priorities' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]}
        />

        <AsyncSelect
          value={filters.assignee}
          onChange={(e) => handleFilterChange("assignee", e.target.value)}
          options={[{ value: '', label: 'All Assignees' }, { value: 'unassigned', label: 'Unassigned' }, ...personnel.map(p => ({ value: p.id, label: p.name }))]}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={clearFilters} variant="ghost">
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default TaskFilters;
