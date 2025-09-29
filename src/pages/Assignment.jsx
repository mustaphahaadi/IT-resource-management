import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Separator } from "../components/ui/separator"
import { apiService } from "../services/api"
import StatusBadge from "../components/ui/status-badge"

const Assignment = () => {
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState("")

  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const [available, setAvailable] = useState([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)

  const [skillFilter, setSkillFilter] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true)
      const res = await apiService.getTasks({ status: "pending" })
      // API may be paginated; handle both list and paginated formats
      const list = res.data?.results || res.data || []
      setTasks(Array.isArray(list) ? list : [])
      // Auto-select first pending task for convenience
      if (!selectedTaskId && list.length) {
        setSelectedTaskId(String(list[0].id))
      }
    } catch (e) {
      setError("Failed to load pending tasks")
    } finally {
      setLoadingTasks(false)
    }
  }

  const fetchSuggestions = async (taskId) => {
    if (!taskId) return
    try {
      setLoadingSuggestions(true)
      setError("")
      const res = await apiService.getAssignmentSuggestions(taskId)
      const list = res.data?.suggestions || []
      setSuggestions(list)
    } catch (e) {
      setError("Failed to load assignment suggestions")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const fetchAvailable = async () => {
    try {
      setLoadingAvailable(true)
      setError("")
      const res = await apiService.getAvailablePersonnel(undefined, skillFilter || undefined)
      const list = res.data?.available_technicians || []
      setAvailable(list)
    } catch (e) {
      setError("Failed to load available technicians")
    } finally {
      setLoadingAvailable(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])
  useEffect(() => { if (selectedTaskId) fetchSuggestions(selectedTaskId) }, [selectedTaskId])

  const handleAssign = async (personnelId) => {
    if (!selectedTaskId) return
    setError("")
    setSuccess("")
    try {
      await apiService.assignTask(selectedTaskId, personnelId)
      setSuccess("Task assigned successfully")
      // Refresh tasks and suggestions
      await fetchTasks()
      setSuggestions([])
      setAvailable([])
    } catch (e) {
      const msg = e?.response?.data?.error || "Failed to assign task"
      setError(msg)
    }
  }

  const selectedTask = useMemo(() => {
    return tasks.find(t => String(t.id) === String(selectedTaskId))
  }, [tasks, selectedTaskId])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Select Pending Task</Label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTasks ? "Loading tasks..." : "Select a pending task"} />
                </SelectTrigger>
                <SelectContent>
                  {(tasks || []).map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.title || t.request_title || `Task #${t.id}`} ({t.priority})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="secondary" onClick={() => fetchTasks()} disabled={loadingTasks}>
                {loadingTasks ? "Refreshing..." : "Refresh Tasks"}
              </Button>
            </div>
          </div>

          {selectedTask && (
            <div className="text-sm text-gray-600">
              <div className="flex flex-wrap gap-3 items-center">
                <span>Selected:</span>
                <span className="font-medium">{selectedTask.title || selectedTask.request_title}</span>
                <StatusBadge status={selectedTask.priority} />
                <StatusBadge status={selectedTask.status} />
                {selectedTask.request_ticket && (
                  <span className="text-gray-500">Ticket: {selectedTask.request_ticket}</span>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Assignment Suggestions</h3>
              <Button variant="ghost" onClick={() => selectedTaskId && fetchSuggestions(selectedTaskId)} disabled={loadingSuggestions}>
                {loadingSuggestions ? "Loading..." : "Refresh Suggestions"}
              </Button>
            </div>

            {loadingSuggestions && <p className="text-sm text-gray-500">Loading suggestions...</p>}
            {!loadingSuggestions && suggestions.length === 0 && (
              <p className="text-sm text-gray-500">No suggestions available.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map(s => (
                <div key={s.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500">Employee #{s.employee_id} • Dept: {s.department}</div>
                    <div className="text-xs text-gray-500">Skill: {s.skill_level} • Current {s.current_tasks}/{s.max_tasks}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleAssign(s.id)} disabled={!selectedTaskId}>Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Available Technicians</h3>
              <div className="flex items-center gap-2">
                <Input placeholder="Filter by skill (e.g., network)" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="w-56" />
                <Button variant="secondary" onClick={fetchAvailable} disabled={loadingAvailable}>
                  {loadingAvailable ? "Loading..." : "Search"}
                </Button>
              </div>
            </div>

            {loadingAvailable && <p className="text-sm text-gray-500">Loading available technicians...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {available.map(t => (
                <div key={t.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.user?.first_name} {t.user?.last_name}</div>
                    <div className="text-xs text-gray-500">Employee #{t.employee_id} • Dept: {t.department}</div>
                    <div className="text-xs text-gray-500">Skill: {t.skill_level} • Current {t.workload?.current_tasks}/{t.workload?.max_tasks} ({t.workload?.utilization_percentage}%)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleAssign(t.id)} disabled={!selectedTaskId}>Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Assignment
