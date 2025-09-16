"use client"

import { useState, useEffect } from "react"
import { apiService } from "../../services/api"

const EquipmentFilters = ({ filters, onFiltersChange }) => {
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchFilterData = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        apiService.get("/inventory/categories/"),
        apiService.get("/inventory/locations/"),
      ])
      setCategories(categoriesRes.data.results || categoriesRes.data)
      setLocations(locationsRes.data.results || locationsRes.data)
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
      category: "",
      location: "",
      priority: "",
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
            <option value="active">Active</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="retired">Retired</option>
            <option value="broken">Broken</option>
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
          <label className="block text-sm font-medium text-foreground mb-1">Location</label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.building} - {loc.floor} - {loc.room}
              </option>
            ))}
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
      </div>

      <div className="flex justify-end">
        <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground underline">
          Clear all filters
        </button>
      </div>
    </div>
  )
}

export default EquipmentFilters
