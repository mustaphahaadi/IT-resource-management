import { useEffect, useMemo, useState } from "react"
import PageHeader from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import AsyncSelect from "../components/ui/AsyncSelect"
import { Switch } from "../components/ui/switch"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"
import { useToast } from "../components/ui/use-toast"
import { apiService } from "../services/api"
import { usePermissions } from "../contexts/PermissionsContext"
import useOptions from "../hooks/useOptions"

const DEFAULT_FORM = {
  user: null,
  employee_id: "",
  department: "",
  skill_level: "intermediate",
  specializations: "",
  phone: "",
  max_concurrent_tasks: 5,
  is_available: true,
}

const SKILL_LEVELS = [
  { value: "junior", label: "Junior" },
  { value: "intermediate", label: "Intermediate" },
  { value: "senior", label: "Senior" },
  { value: "expert", label: "Expert" },
]

const TeamManagement = () => {
  const { toast } = useToast()
  const { hasPermission } = usePermissions()
  const [personnel, setPersonnel] = useState([])
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [skillFilter, setSkillFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [users, setUsers] = useState([])

  const canManagePersonnel = hasPermission("personnel.manage") || hasPermission("personnel.assign")

  useEffect(() => {
    fetchPersonnel()
    if (canManagePersonnel) {
      fetchUsers()
    }
  }, [])

  const { options: departmentOptions } = useOptions('/inventory/departments/', (d) => ({ value: d.code || d.slug || d.name, label: d.name || d.display_name || d.title }), [/* once */])

  const fetchUsers = async () => {
    try {
      const response = await apiService.getActiveUsers()
      setUsers(response.data.results || response.data)
    } catch (error) {
      console.error("Failed to load users", error)
    }
  }

  // Remote search handler for linked-user AsyncSelect
  const searchAssignableUsers = async (q) => {
    const res = await apiService.getUsersForAssignment({ search: q, page: 1 })
    const list = res.data?.results || res.data || []
    return list.map(u => ({ value: u.id, label: u.full_name || `${u.first_name} ${u.last_name}` }))
  }

  const fetchPersonnel = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPersonnel()
      setPersonnel(response.data.results || response.data)
    } catch (error) {
      console.error("Failed to load personnel", error)
      toast({
        title: "Failed to load technicians",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPersonnel = useMemo(() => {
    const term = search.toLowerCase()
    return personnel.filter((person) => {
      const matchesSearch = term
        ? [person.user_name, person.employee_id, person.specializations, person.department]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true
      const matchesDepartment =
        departmentFilter === "all" || person.department?.toLowerCase() === departmentFilter
      const matchesSkill = skillFilter === "all" || person.skill_level === skillFilter
      const matchesAvailability =
        availabilityFilter === "all" || `${person.is_available}` === availabilityFilter

      return matchesSearch && matchesDepartment && matchesSkill && matchesAvailability
    })
  }, [personnel, search, departmentFilter, skillFilter, availabilityFilter])

  const resetForm = () => {
    setFormData(DEFAULT_FORM)
    setEditingId(null)
    setDialogOpen(false)
  }

  const handleCreate = () => {
    setFormData(DEFAULT_FORM)
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEdit = (record) => {
    setFormData({
      user: record.user?.id || null,
      employee_id: record.employee_id || "",
      department: record.department || "",
      skill_level: record.skill_level || "intermediate",
      specializations: record.specializations || "",
      phone: record.phone || "",
      max_concurrent_tasks: record.max_concurrent_tasks || 5,
      is_available: Boolean(record.is_available),
    })
    setEditingId(record.id)
    setDialogOpen(true)
  }

  const handleDelete = async (record) => {
    const confirmed = window.confirm(`Remove technician ${record.user_name}?`)
    if (!confirmed) return

    try {
      await apiService.deletePersonnel(record.id)
      toast({ title: "Technician removed" })
      fetchPersonnel()
    } catch (error) {
      console.error("Delete failed", error)
      toast({
        title: "Unable to remove technician",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      ...formData,
      max_concurrent_tasks: Number(formData.max_concurrent_tasks) || 5,
    }

    try {
      if (editingId) {
        await apiService.updatePersonnel(editingId, payload)
        toast({ title: "Technician updated" })
      } else {
        await apiService.createPersonnel(payload)
        toast({ title: "Technician added" })
      }
      resetForm()
      fetchPersonnel()
    } catch (error) {
      console.error("Save failed", error)
      toast({
        title: "Unable to save technician",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Management"
        description="Manage IT technicians, availability, and skill profiles."
        actions={
          canManagePersonnel
            ? [
                {
                  label: "Add Technician",
                  onClick: handleCreate,
                  variant: "default",
                },
                {
                  label: "Refresh",
                  onClick: fetchPersonnel,
                  variant: "outline",
                },
              ]
            : [
                {
                  label: "Refresh",
                  onClick: fetchPersonnel,
                  variant: "outline",
                },
              ]
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input
            placeholder="Search by name, employee ID, specialization"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {(departmentOptions || []).map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Skill level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All skill levels</SelectItem>
              {SKILL_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Available</SelectItem>
              <SelectItem value="false">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Technician Roster</CardTitle>
          <span className="text-sm text-muted-foreground">{filteredPersonnel.length} technicians</span>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Workload</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonnel.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="font-medium">{person.user_name || person.username}</div>
                    <div className="text-xs text-muted-foreground">{person.user?.email}</div>
                  </TableCell>
                  <TableCell>{person.employee_id}</TableCell>
                  <TableCell className="capitalize">{person.department || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {person.skill_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {person.specializations || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={person.is_available ? "success" : "destructive"}>
                      {person.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {person.current_task_count ?? person.workload?.current_tasks ?? 0} / {person.max_concurrent_tasks ?? person.workload?.max_tasks ?? 5}
                    </div>
                    {person.workload?.utilization_percentage !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(person.workload.utilization_percentage)}% utilized
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(person)} disabled={!canManagePersonnel}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(person)} disabled={!hasPermission("personnel.remove")}> 
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredPersonnel.length && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {loading ? "Loading technicians..." : "No technicians match your filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Technician" : "Add Technician"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Linked User</label>
                {/* Use searchable AsyncSelect to locate assignable users (calls server) */}
                <AsyncSelect
                  searchable
                  onSearch={searchAssignableUsers}
                  value={formData.user ? String(formData.user) : ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, user: e.target.value ? Number(e.target.value) : null }))}
                  placeholder={editingId ? "Locked (already linked)" : "Search users by name or email"}
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee ID</label>
                <Input
                  required
                  value={formData.employee_id}
                  onChange={(event) => setFormData((prev) => ({ ...prev, employee_id: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input
                  required
                  placeholder="e.g. Service Desk"
                  value={formData.department}
                  onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Skill Level</label>
                <Select
                  value={formData.skill_level}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, skill_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Specializations</label>
                <Textarea
                  placeholder="Separate with commas (e.g. Network Security, Windows Server)"
                  value={formData.specializations}
                  onChange={(event) => setFormData((prev) => ({ ...prev, specializations: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Concurrent Tasks</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.max_concurrent_tasks}
                  onChange={(event) => setFormData((prev) => ({ ...prev, max_concurrent_tasks: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <div className="flex items-center space-x-2 rounded-md border p-2">
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_available: checked }))}
                  />
                  <span className="text-sm text-muted-foreground">Technician is available for assignment</span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || (!editingId && !formData.user)}>
                {saving ? "Saving..." : editingId ? "Update Technician" : "Add Technician"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeamManagement
