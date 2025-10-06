import { useState, useEffect } from "react"
import { apiService } from "../../services/api"
import UserSelect from "../ui/user-select";
import { NativeSelect } from "../ui/native-select";
import { Button } from "../ui/button";

const RequestFilters = ({ filters, onFiltersChange }) => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchFilterData = async () => {
    try {
      const categoriesRes = await apiService.get("/requests/categories/")
      setCategories(categoriesRes.data.results || categoriesRes.data)
    } catch (error) {
      console.error("Error fetching filter data:", error)
    }
  }

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
        <NativeSelect
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </NativeSelect>

        <NativeSelect
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </NativeSelect>

        <NativeSelect
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </NativeSelect>

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
