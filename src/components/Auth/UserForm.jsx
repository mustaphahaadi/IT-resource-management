import { useState, useEffect } from "react"
import { apiService } from "../../services/api"

const UserForm = ({ user, roles, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    department: "",
    phone_number: "",
    employee_id: "",
    is_active: true,
    password: "",
    confirm_password: "",
  })
  const [errors, setErrors] = useState({})
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "",
        department: user.department || "",
        phone_number: user.phone_number || "",
        employee_id: user.employee_id || "",
        is_active: user.is_active !== undefined ? user.is_active : true,
        password: "",
        confirm_password: "",
      })
    }
  }, [user])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true)
        const res = await apiService.getDepartments()
        const list = res.data?.results || res.data || []

        const ALLOWED = new Set([
          'it','administration','human_resources','finance','operations','marketing','sales','customer_service','legal','facilities','other'
        ])
        const mapToAllowed = (raw, label) => {
          const norm = String(raw || label || '')
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/\s+/g, '_')
            .replace(/[^a-z_]/g, '')
          if (/(information_technology|it|tech|i_t)/.test(norm)) return 'it'
          if (/(human_resources|hr)/.test(norm)) return 'human_resources'
          if (/(customer_service|support|helpdesk)/.test(norm)) return 'customer_service'
          if (/(ops|operations)/.test(norm)) return 'operations'
          if (/(finance|accounting)/.test(norm)) return 'finance'
          if (/(legal)/.test(norm)) return 'legal'
          if (/(facilities|facility|maintenance)/.test(norm)) return 'facilities'
          if (/(marketing)/.test(norm)) return 'marketing'
          if (/(sales)/.test(norm)) return 'sales'
          if (ALLOWED.has(norm)) return norm
          return 'other'
        }

        const formatted = (Array.isArray(list) ? list : []).map(d => {
          const label = d.name || d.display_name || d.title || 'Department'
          const raw = d.code || d.slug || (d.name ? d.name : 'other')
          const value = mapToAllowed(raw, label)
          return { value, label }
        })
        // Dedupe by value, keep first label
        const seen = new Set()
        const deduped = []
        for (const item of formatted) {
          if (!seen.has(item.value)) { seen.add(item.value); deduped.push(item) }
        }
        deduped.sort((a, b) => a.label.localeCompare(b.label))
        setDepartments(deduped)
      } catch (e) {
        setDepartments([
          { value: 'it', label: 'Information Technology' },
          { value: 'administration', label: 'Administration' },
          { value: 'operations', label: 'Operations' },
          { value: 'other', label: 'Other' },
        ])
      } finally {
        setLoadingDepartments(false)
      }
    }
    fetchDepartments()
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!formData.role) newErrors.role = "Role is required"

    if (!user) {
      if (!formData.password) newErrors.password = "Password is required"
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match"
      }
    } else if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const submitData = { ...formData }
      if (user && !submitData.password) {
        delete submitData.password
        delete submitData.confirm_password
      }
      onSubmit(submitData)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{user ? "Edit User" : "Add New User"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? "border-destructive" : "border-gray-300"
                }`}
              />
              {errors.username && <p className="text-sm text-destructive mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? "border-destructive" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.first_name ? "border-destructive" : "border-gray-300"
                }`}
              />
              {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.last_name ? "border-destructive" : "border-gray-300"
                }`}
              />
              {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.role ? "border-destructive" : "border-gray-300"
                }`}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.name || role.id || role.display_name} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loadingDepartments}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">{loadingDepartments ? 'Loading departments...' : 'Select Department'}</option>
                {(Array.isArray(departments) ? departments : []).map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {(!user || formData.password) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password {!user && "*"}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? "border-destructive" : "border-gray-300"
                  }`}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password {!user && "*"}</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirm_password ? "border-destructive" : "border-gray-300"
                  }`}
                />
                {errors.confirm_password && <p className="text-sm text-destructive mt-1">{errors.confirm_password}</p>}
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active User
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
