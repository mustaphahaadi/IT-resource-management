"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { apiService } from "../../services/api"

const RolePermissions = ({ roles, onClose, onUpdate }) => {
  const [permissions, setPermissions] = useState([])
  const [rolePermissions, setRolePermissions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissions()
    fetchRolePermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const response = await apiService.get("/auth/permissions/")
      setPermissions(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching permissions:", error)
    }
  }

  const fetchRolePermissions = async () => {
    try {
      const response = await apiService.get("/auth/role-permissions/")
      const rolePermsMap = {}
      response.data.forEach((rp) => {
        if (!rolePermsMap[rp.role]) rolePermsMap[rp.role] = []
        rolePermsMap[rp.role].push(rp.permission)
      })
      setRolePermissions(rolePermsMap)
    } catch (error) {
      console.error("Error fetching role permissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = async (roleId, permissionId, hasPermission) => {
    try {
      if (hasPermission) {
        await apiService.delete(`/auth/role-permissions/${roleId}/${permissionId}/`)
      } else {
        await apiService.post("/auth/role-permissions/", {
          role: roleId,
          permission: permissionId,
        })
      }
      fetchRolePermissions()
    } catch (error) {
      console.error("Error updating role permission:", error)
    }
  }

  const groupedPermissions = permissions.reduce((groups, permission) => {
    const category = permission.category || "General"
    if (!groups[category]) groups[category] = []
    groups[category].push(permission)
    return groups
  }, {})

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Role Permissions Management</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading permissions...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-4 font-medium">Permission</th>
                          {roles.map((role) => (
                            <th key={role.id} className="text-center py-2 px-4 font-medium">
                              {role.display_name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categoryPermissions.map((permission) => (
                          <tr key={permission.id} className="border-b border-border">
                            <td className="py-2 px-4">
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-muted-foreground">{permission.description}</div>
                              </div>
                            </td>
                            {roles.map((role) => {
                              const hasPermission = rolePermissions[role.id]?.includes(permission.id)
                              return (
                                <td key={role.id} className="py-2 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={hasPermission || false}
                                    onChange={() => handlePermissionToggle(role.id, permission.id, hasPermission)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                                  />
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default RolePermissions
