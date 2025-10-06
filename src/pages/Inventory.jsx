import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { usePermissions, PermissionGate } from "../contexts/PermissionsContext"
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
import EquipmentFilters from "../components/Inventory/EquipmentFilters"
import EquipmentForm from "../components/Inventory/EquipmentForm"
import EquipmentDetails from "../components/Inventory/EquipmentDetails"

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
  const navigate = useNavigate()
  const location = useLocation()
  const { equipmentId } = useParams()
  const { hasPermission, canViewScope, canEditScope, userRole } = usePermissions()

  const getBasePath = () => (location.pathname.startsWith("/app/") ? "/app/inventory" : "/inventory")

  useEffect(() => {
    fetchEquipment()
  }, [filters, searchTerm])

  useEffect(() => {
    const base = getBasePath()
    const openNew = location.pathname.endsWith("/new")
    const openEdit = location.pathname.endsWith("/edit")

    if (openNew) {
      setSelectedEquipment(null)
      setShowForm(true)
      setShowDetails(false)
      return
    }

    if (equipmentId && openEdit) {
      const existing = equipment.find((e) => e.id?.toString() === equipmentId)
      if (existing) {
        setSelectedEquipment(existing)
      } else {
        apiService
          .getEquipmentById(equipmentId)
          .then((res) => setSelectedEquipment(res.data))
          .catch(() => {})
      }
      setShowForm(true)
      setShowDetails(false)
      return
    }

    if (equipmentId) {
      const existing = equipment.find((e) => e.id?.toString() === equipmentId)
      if (existing) {
        setSelectedEquipment(existing)
      } else {
        apiService
          .getEquipmentById(equipmentId)
          .then((res) => setSelectedEquipment(res.data))
          .catch(() => {})
      }
      setShowDetails(true)
      setShowForm(false)
      return
    }

    // default close
    setShowForm(false)
    setShowDetails(false)
    setSelectedEquipment(null)
  }, [location.pathname, equipmentId, equipment])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
      }
      if (searchTerm) params.search = searchTerm
      const res = await apiService.getEquipment(params)
      const data = res.data.results || res.data
      setEquipment(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching equipment:", error)
      setEquipment([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddEquipment = () => {
    navigate(`${getBasePath()}/new`)
  }

  const handleEditEquipment = (item) => {
    navigate(`${getBasePath()}/${item.id}/edit`)
  }

  const handleViewEquipment = (item) => {
    navigate(`${getBasePath()}/${item.id}`)
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
    navigate(getBasePath())
    setSelectedEquipment(null)
    fetchEquipment()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "retired":
        return "bg-gray-100 text-gray-800"
      case "broken":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Inventory</h1>
          <p className="text-gray-600 mt-1">Manage hospital IT equipment and assets</p>
        </div>
        <PermissionGate permissions="equipment.create">
          <Button onClick={handleAddEquipment} className="flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>Add Equipment</span>
          </Button>
        </PermissionGate>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
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
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>
        {showFilters && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <EquipmentFilters filters={filters} onFiltersChange={setFilters} />
            </CardContent>
          </Card>
        )}
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
                          <p className="text-sm text-gray-500">S/N: {item.serial_number || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{item.category_name}</td>
                      <td className="py-4 px-4 text-gray-700">{item.location_name}</td>
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
                          <PermissionGate permissions="equipment.edit">
                            <button
                              onClick={() => handleEditEquipment(item)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate permissions="equipment.delete">
                            <button
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </PermissionGate>
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
        <EquipmentForm
          equipment={selectedEquipment}
          onClose={() => navigate(getBasePath())}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDetails && selectedEquipment && (
        <EquipmentDetails equipment={selectedEquipment} onClose={() => navigate(getBasePath())} />
      )}
    </div>
  )
}

export default Inventory
