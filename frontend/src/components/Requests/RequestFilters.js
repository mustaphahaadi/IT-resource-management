"use client"

import { useState, useEffect } from "react"
import { apiService } from "../../services/api"

const RequestFilters = ({ filters, onFiltersChange }) => {
  const [categories, setCategories] = useState([])
  const [personnel, setPersonnel] = useState([])

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchFilterData = async () => {
    try {
      const [categoriesRes, personnelRes] = await Promise.all([
        apiService.get("/requests/categories/"),
        apiService.getPersonnel(),
      ])
      setCategories(categoriesRes.data.results || categoriesRes.data)
      setPersonnel(personnelRes.data.results || personnelRes.data)
    } catch (error) {
      console.error("Error fetching filter data:", error)
    }
  }

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Assigned To</label>
          <select
            value={filters.assigned_to}
            onChange={(e) => handleFilterChange("assigned_to", e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {personnel.map((person) => (
              <option key={person.id} value={person.user.id}>
                {person.user_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground underline">
          Clear all filters
        </button>
      </div>
    </div>
  )
}

export default RequestFilters
