import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Separator } from "../components/ui/separator"
import { apiService } from "../services/api"

const AdminSettings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await apiService.getSystemSettings()
      setSettings(res.data || {})
    } catch (e) {
      setError("Failed to load system settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name, checked) => {
    setSettings(prev => ({ ...prev, [name]: checked }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await apiService.updateSystemSettings(settings)
      setSettings(res.data || settings)
      setSuccess("Settings saved")
    } catch (e) {
      setError("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6"><p className="text-sm text-gray-500">Loading settings...</p></div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input id="site_name" name="site_name" value={settings.site_name || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_timezone">Default Timezone</Label>
                <Input id="default_timezone" name="default_timezone" value={settings.default_timezone || "UTC"} onChange={handleChange} />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-xs text-gray-500">Restrict access to administrators</p>
              </div>
              <Switch id="maintenance_mode" checked={!!settings.maintenance_mode} onCheckedChange={(c) => handleToggle('maintenance_mode', c)} />
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminSettings
