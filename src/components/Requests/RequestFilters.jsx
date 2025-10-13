import { useState, useEffect } from "react"
import { apiService } from "../../services/api"
import UserSelect from "../ui/user-select";
import { NativeSelect } from "../ui/native-select";
import { Button } from "../ui/button";
import AsyncSelect from "../ui/AsyncSelect"
import useOptions from "../../hooks/useOptions"

const RequestFilters = ({ filters, onFiltersChange }) => {
  // useOptions provides caching and mapping; fallback to empty list
  const { options: categories, loading: loadingCategories, error: categoriesError } = useOptions('/requests/categories/', (c) => ({ value: c.id, label: c.name }))

  const handleFilterChange = (key, value) => {
    let finalValue = value
    // Handle the custom event from UserSelect
    if (typeof value === 'object' && value.target && 'selectedObject' in value.target) {
      finalValue = value.target.value
    }
    
    onFiltersChange({
      ...filters,
      [key]: finalValue,
    })
  }
  const clearFilters = () => {
    onFiltersChange({
      status: "",
      priority: "",
      category: "",
      assigned_to: "",
    })
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AsyncSelect
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'pending', label: 'Pending' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
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
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          options={categories}
          loading={loadingCategories}
          error={categoriesError}
          placeholder="All Categories"
        />

        <UserSelect
          name="assigned_to"
          value={filters.assigned_to}
          onChange={(e) => handleFilterChange("assigned_to", e)}
          userType="personnel"
          placeholder="All Assignees"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={clearFilters} variant="ghost">
          Clear Filters
        </Button>
      </div>
    </div>
  )
}

export default RequestFilters
