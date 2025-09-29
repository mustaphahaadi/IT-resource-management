import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { XMarkIcon, ComputerDesktopIcon, CalendarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"

const EquipmentDetails = ({ equipment, onClose }) => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <ComputerDesktopIcon className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>{equipment.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Asset Tag: {equipment.asset_tag}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                equipment.status,
              )}`}
            >
              {equipment.status}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                equipment.priority,
              )}`}
            >
              {equipment.priority} priority
            </span>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                  <p className="text-foreground">{equipment.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-foreground">{equipment.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="text-foreground">{equipment.serial_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-foreground">{equipment.category_name}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Location & Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-foreground">{equipment.location_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                  <p className="text-foreground">{equipment.vendor_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                  <p className="text-foreground">{equipment.assigned_to_name || "Unassigned"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Information */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span>Financial Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Cost</p>
                <p className="text-foreground">
                  {equipment.purchase_cost ? `$${Number.parseFloat(equipment.purchase_cost).toLocaleString()}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                <p className="text-foreground">
                  {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warranty Expiry</p>
                <p
                  className={
                    equipment.warranty_expiry
                      ? new Date(equipment.warranty_expiry) < new Date()
                        ? "text-destructive"
                        : new Date(equipment.warranty_expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                          ? "text-orange-600"
                          : "text-foreground"
                      : "text-foreground"
                  }
                >
                  {equipment.warranty_expiry ? new Date(equipment.warranty_expiry).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-foreground">{new Date(equipment.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-foreground">{new Date(equipment.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {equipment.description && (
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{equipment.description}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EquipmentDetails
