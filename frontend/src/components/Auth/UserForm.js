"use client"

import { useState, useEffect } from "react"

const UserForm = ({ user, roles, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    department: "",
    phone: "",
    is_active: true,
    password: "",
    confirm_password: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "",
        department: user.department || "",
        phone: user.phone || "",
        is_active: user.is_active !== undefined ? user.is_active : true,
        password: "",
        confirm_password: "",
      })
    }
  }, [user])

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
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{user ? "Edit User" : "Add New User"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.username ? "border-destructive" : "border-border"
                }`}
              />
              {errors.username && <p className="text-sm text-destructive mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? "border-destructive" : "border-border"
                }`}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.first_name ? "border-destructive" : "border-border"
                }`}
              />
              {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.last_name ? "border-destructive" : "border-border"
                }`}
              />
              {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.role ? "border-destructive" : "border-border"
                }`}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {(!user || formData.password) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Password {!user && "*"}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password {!user && "*"}</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.confirm_password ? "border-destructive" : "border-border"
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
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-foreground">
              Active User
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent"
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
