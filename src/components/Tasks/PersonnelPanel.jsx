import { useState } from "react"
import { apiService } from "../../services/api"

const PersonnelPanel = ({ personnel, onClose, onUpdate }) => {
  const [showForm, setShowForm] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    skills: "",
    max_concurrent_tasks,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedPerson) {
        await apiService.put(`/personnel/${selectedPerson.id}/`, formData)
      } else {
        await apiService.post("/personnel/", formData)
      }
      onUpdate()
      setShowForm(false)
      setSelectedPerson(null)
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
        skills: "",
        max_concurrent_tasks,
      })
    } catch (error) {
      console.error("Error saving personnel:", error)
    }
  }

  const handleEdit = (person) => {
    setSelectedPerson(person)
    setFormData({
      name: person.name || "",
      email: person.email || "",
      role: person.role || "",
      department: person.department || "",
      skills: person.skills || "",
      max_concurrent_tasks: person.max_concurrent_tasks || 5,
    })
    setShowForm(true)
  }

  const handleDelete = async (personId) => {
    if (window.confirm("Are you sure you want to delete this person?")) {
      try {
        await apiService.delete(`/personnel/${personId}/`)
        onUpdate()
      } catch (error) {
        console.error("Error deleting personnel:", error)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Personnel Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Add Personnel
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Role</option>
                  <option value="IT Manager">IT Manager</option>
                  <option value="System Administrator">System Administrator</option>
                  <option value="Network Engineer">Network Engineer</option>
                  <option value="Help Desk Technician">Help Desk Technician</option>
                  <option value="Security Specialist">Security Specialist</option>
                  <option value="Database Administrator">Database Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
                placeholder="Windows, Linux, Networking, Security..."
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Concurrent Tasks</label>
              <input
                type="number"
                value={formData.max_concurrent_tasks}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, max_concurrent_tasks: Number.parseInt(e.target.value) }))
                }
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setSelectedPerson(null)
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {selectedPerson ? "Update" : "Add"} Personnel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {personnel.map((person) => (
              <div key={person.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{person.name}</h3>
                    <p className="text-muted-foreground">{person.role}</p>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                    {person.skills && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">Skills: </span>
                        <span className="text-sm text-muted-foreground">{person.skills}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(person)}
                      className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )))
      </div>
    </div>
  )
}

    </div>
  )
}
export default PersonnelPanel
