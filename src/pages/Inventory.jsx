import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  ComputerDesktopIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline"
import { apiService } from "../services/api"
import EquipmentForm from "../components/Inventory/EquipmentForm"
import EquipmentDetails from "../components/Inventory/EquipmentDetails"
import EquipmentFilters from "../components/Inventory/EquipmentFilters"

const Inventory = () => {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    location: "",
    priority: "",
  })

  useEffect(() => {
    fetchEquipment()
  }, [filters, searchTerm])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        search,
      }
      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key]
      })

      const response = await apiService.getEquipment(params)
      setEquipment(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching equipment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEquipment = () => {
    setSelectedEquipment(null)
    setShowForm(true)
  }

  const handleEditEquipment = (item) => {
    setSelectedEquipment(item)
    setShowForm(true)
  }

  const handleViewEquipment = (item) => {
    setSelectedEquipment(item)
    setShowDetails(true)
  }

  const handleDeleteEquipment = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await apiService.deleteEquipment(id)
        fetchEquipment()
      } catch (error) {
        console.error("Error deleting equipment:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedEquipment(null)
    fetchEquipment()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-primary bg-primary/10"
      case "maintenance":
        return "text-accent bg-accent/10"
      case "retired":
        return "text-muted-foreground bg-muted"
      case "broken":
        return "text-destructive bg-destructive/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-destructive bg-destructive/10"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "medium":
        return "text-accent bg-accent/10"
      case "low":
        return "text-muted-foreground bg-muted"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IT Inventory</h1>
          <p className="text-muted-foreground">Manage hospital IT equipment and assets</p>
        </div>
        <Button onClick={handleAddEquipment} className="flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Add Equipment</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search equipment by name, asset tag, model, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <EquipmentFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ComputerDesktopIcon className="w-5 h-5" />
            <span>Equipment ({equipment.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading equipment...</p>
            </div>
          ) : equipment.length === 0 ? (
            <div className="text-center py-8">
              <ComputerDesktopIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No equipment found</p>
              <Button onClick={handleAddEquipment} className="mt-4">
                Add First Equipment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Asset Tag</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Warranty</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.manufacturer} {item.model}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-muted px-2 py-1 rounded text-sm">{item.asset_tag}</code>
                      </td>
                      <td className="py-3 px-4 text-sm">{item.category_name}</td>
                      <td className="py-3 px-4 text-sm">{item.location_name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            item.priority,
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {item.warranty_expiry ? (
                          <span
                            className={
                              new Date(item.warranty_expiry) < new Date()
                                ? "text-destructive"
                                : new Date(item.warranty_expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                  ? "text-orange-600"
                                  : "text-foreground"
                            }
                          >
                            {new Date(item.warranty_expiry).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewEquipment(item)}
                            className="p-1 text-muted-foreground hover:text-primary"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEquipment(item)}
                            className="p-1 text-muted-foreground hover:text-accent"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {item.status === "active" && (
                            <button
                              className="p-1 text-muted-foreground hover:text-orange-600"
                              title="Schedule Maintenance"
                            >
                              <WrenchScrewdriverIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEquipment(item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Form Modal */}
      {showForm && (
        <EquipmentForm equipment={selectedEquipment} onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}

      {/* Equipment Details Modal */}
      {showDetails && selectedEquipment && (
        <EquipmentDetails equipment={selectedEquipment} onClose={() => setShowDetails(false)} />
      )}
    </div>
  )
}

export default Inventory
