import { useState, useEffect } from "react"
import { apiService } from "../../services/api"

const PersonnelPanel = ({ personnel, onClose, onUpdate }) => {
    const [showForm, setShowForm] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState(null)
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState("")
    const [formData, setFormData] = useState({
        employee_id: "",
        department: "",
        skill_level: "intermediate",
        specializations: "",
        phone: "",
        is_available: true,
        max_concurrent_tasks: 5,
    })

    useEffect(() => {
        // Load users for creating personnel when form is opened for creation
        if (showForm && !selectedPerson) {
            fetchUsers()
        }
    }, [showForm, selectedPerson])

    const fetchUsers = async () => {
        try {
            const res = await apiService.getUsers({ page_size: 100 })
            const data = res.data.results || res.data
            setUsers(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error("Error fetching users for personnel creation:", e)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (selectedPerson) {
                await apiService.updatePersonnel(selectedPerson.id, formData)
            } else {
                // Validate required fields for creation
                if (!selectedUserId || !formData.employee_id || !formData.department) {
                    alert("Please select a user and provide employee ID and department")
                    return
                }
                await apiService.createPersonnel({
                    user: selectedUserId,
                    employee_id: formData.employee_id,
                    department: formData.department,
                    skill_level: formData.skill_level,
                    specializations: formData.specializations,
                    phone: formData.phone,
                    is_available: formData.is_available,
                    max_concurrent_tasks: formData.max_concurrent_tasks,
                })
            }
            onUpdate()
            setShowForm(false)
            setSelectedPerson(null)
            setFormData({
                employee_id: "",
                department: "",
                skill_level: "intermediate",
                specializations: "",
                phone: "",
                is_available: true,
                max_concurrent_tasks: 5,
            })
            setSelectedUserId("")
        } catch (error) {
            console.error("Error saving personnel:", error)
        }
    }

    const handleEdit = (person) => {
        setSelectedPerson(person)
        setFormData({
            employee_id: person.employee_id || "",
            department: person.department || "",
            skill_level: person.skill_level || "intermediate",
            specializations: person.specializations || "",
            phone: person.phone || "",
            is_available: person.is_available ?? true,
            max_concurrent_tasks: person.max_concurrent_tasks || 5,
        })
        setShowForm(true)
    }

    const handleDelete = async (personId) => {
        if (window.confirm("Are you sure you want to delete this person?")) {
            try {
                await apiService.deletePersonnel(personId)
                onUpdate()
            } catch (error) {
                console.error("Error deleting personnel:", error)
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        {!selectedPerson && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select User</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name} {u.last_name} ({u.email || u.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                                    <input
                                        type="text"
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, employee_id: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedPerson && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={selectedPerson.user_name || ""}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={selectedPerson.username || ""}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                                <select
                                    value={formData.skill_level}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, skill_level: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="junior">Junior</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="senior">Senior</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Specializations (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.specializations}
                                onChange={(e) => setFormData((prev) => ({ ...prev, specializations: e.target.value }))}
                                placeholder="Windows, Linux, Networking, Security..."
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    id="is_available"
                                    type="checkbox"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, is_available: e.target.checked }))}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="is_available" className="text-sm font-medium">Available for assignment</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Tasks</label>
                            <input
                                type="number"
                                value={formData.max_concurrent_tasks}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, max_concurrent_tasks: Number.parseInt(e.target.value || 0) }))
                                }
                                min="1"
                                max="20"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setSelectedPerson(null)
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
                                        <h3 className="font-semibold text-lg">{person.user_name || person.username}</h3>
                                        <p className="text-muted-foreground">{person.department} • {person.skill_level?.toUpperCase()}</p>
                                        {person.specializations && (
                                            <div className="mt-2">
                                                <span className="text-sm font-medium">Specializations: </span>
                                                <span className="text-sm text-muted-foreground">{person.specializations}</span>
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PersonnelPanel
