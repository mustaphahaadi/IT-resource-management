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
// Components will be implemented later

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
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock equipment data - replace with real API call
      const mockEquipment = [
        {
          id: 1,
          name: "MRI Scanner - Siemens",
          category: "Medical Imaging",
          status: "active",
          location: "Radiology - Room 101",
          serialNumber: "MRI-2023-001",
          purchaseDate: "2023-01-15",
          warrantyExpiry: "2026-01-15",
          lastMaintenance: "2024-01-10",
          nextMaintenance: "2024-04-10",
          priority: "high",
          assignedTo: "Dr. Sarah Johnson",
          notes: "Regular maintenance scheduled quarterly"
        },
        {
          id: 2,
          name: "Dell OptiPlex 7090",
          category: "Computing",
          status: "active",
          location: "ICU - Workstation 3",
          serialNumber: "DELL-2023-045",
          purchaseDate: "2023-03-20",
          warrantyExpiry: "2026-03-20",
          lastMaintenance: "2024-01-05",
          nextMaintenance: "2024-07-05",
          priority: "medium",
          assignedTo: "John Smith",
          notes: "Windows 11 Pro, 16GB RAM"
        },
        {
          id: 3,
          name: "Network Switch - Cisco",
          category: "Networking",
          status: "maintenance",
          location: "Server Room A",
          serialNumber: "CISCO-2022-089",
          purchaseDate: "2022-11-10",
          warrantyExpiry: "2025-11-10",
          lastMaintenance: "2024-01-15",
          nextMaintenance: "2024-02-15",
          priority: "critical",
          assignedTo: "Mike Davis",
          notes: "Firmware update in progress"
        }
      ]
      
      // Filter equipment based on search and filters
      let filteredEquipment = mockEquipment
      
      if (searchTerm) {
        filteredEquipment = filteredEquipment.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (filters.status) {
        filteredEquipment = filteredEquipment.filter(item => item.status === filters.status)
      }
      
      if (filters.category) {
        filteredEquipment = filteredEquipment.filter(item => item.category === filters.category)
      }
      
      if (filters.priority) {
        filteredEquipment = filteredEquipment.filter(item => item.priority === filters.priority)
      }
      
      setEquipment(filteredEquipment)
    } catch (error) {
      console.error("Error fetching equipment:", error)
      setEquipment([])
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
        return "text-green-700 bg-green-100"
      case "maintenance":
        return "text-yellow-700 bg-yellow-100"
      case "retired":
        return "text-gray-700 bg-gray-100"
      case "broken":
        return "text-red-700 bg-red-100"
      default:
        return "text-gray-700 bg-gray-100"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-red-700 bg-red-100"
      case "high":
        return "text-orange-700 bg-orange-100"
      case "medium":
        return "text-blue-700 bg-blue-100"
      case "low":
        return "text-gray-700 bg-gray-100"
      default:
        return "text-gray-700 bg-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Inventory</h1>
          <p className="text-gray-600 mt-1">Manage hospital IT equipment and assets</p>
        </div>
        <Button onClick={handleAddEquipment} className="flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Add Equipment</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
            <option value="broken">Broken</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Medical Imaging">Medical Imaging</option>
            <option value="Computing">Computing</option>
            <option value="Networking">Networking</option>
            <option value="Medical Devices">Medical Devices</option>
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
            <span className="text-gray-900">Equipment ({equipment.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading equipment...</p>
            </div>
          ) : equipment.length === 0 ? (
            <div className="text-center py-12">
              <ComputerDesktopIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first piece of equipment"
                }
              </p>
              <Button onClick={handleAddEquipment}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">S/N: {item.serialNumber}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{item.category}</td>
                      <td className="py-4 px-4 text-gray-700">{item.location}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewEquipment(item)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEquipment(item)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(item)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

      {/* Simple modals for forms - placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedEquipment ? 'Edit Equipment' : 'Add Equipment'}
            </h3>
            <p className="text-gray-600 mb-4">Equipment form will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleFormSuccess}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Equipment Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedEquipment.name}</p>
              <p><strong>Category:</strong> {selectedEquipment.category}</p>
              <p><strong>Location:</strong> {selectedEquipment.location}</p>
              <p><strong>Status:</strong> {selectedEquipment.status}</p>
              <p><strong>Serial Number:</strong> {selectedEquipment.serialNumber}</p>
              <p><strong>Assigned To:</strong> {selectedEquipment.assignedTo}</p>
              <p><strong>Notes:</strong> {selectedEquipment.notes}</p>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
