import { useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Alert, AlertDescription } from "../components/ui/alert"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../services/api"
import { 
  UserPlusIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"

const Register = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    department: "",
    employee_id: ""
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />
  }

  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true)
        const response = await apiService.getDepartments()
        const list = response.data?.results || response.data || []
        const formatted = (Array.isArray(list) ? list : []).map(d => ({
          value: d.code || d.slug || (d.name ? d.name.toLowerCase().replace(/\s+/g, '_') : 'other'),
          label: d.name || d.display_name || d.title || 'Department'
        }))
        if (formatted.length) {
          setDepartments(formatted)
        } else {
          setDepartments([
            { value: "it_service_desk", label: "IT Service Desk" },
            { value: "desktop_support", label: "Desktop Support" },
            { value: "field_services", label: "Field Services" },
            { value: "network_infrastructure", label: "Network & Infrastructure" },
            { value: "systems_administration", label: "Systems Administration" },
            { value: "security_operations", label: "Security Operations" },
            { value: "applications_support", label: "Applications Support" },
            { value: "ehr_support", label: "EHR/EMR Support" },
            { value: "clinical_engineering", label: "Clinical Engineering (Biomedical)" },
            { value: "imaging_it", label: "Imaging/Radiology IT" },
            { value: "telecom_voip", label: "Telecommunications/VoIP" },
            { value: "identity_access", label: "Identity & Access Management" },
            { value: "database_reporting", label: "Database & Reporting" },
            { value: "devops_platform", label: "DevOps/Platform" },
            { value: "it_management_pmo", label: "IT Management/PMO" },
            { value: "other", label: "Other" },
          ])
        }
      } catch (e) {
        console.warn('Falling back to default departments:', e)
        setDepartments([
          { value: "it_service_desk", label: "IT Service Desk" },
          { value: "desktop_support", label: "Desktop Support" },
          { value: "field_services", label: "Field Services" },
          { value: "network_infrastructure", label: "Network & Infrastructure" },
          { value: "systems_administration", label: "Systems Administration" },
          { value: "security_operations", label: "Security Operations" },
          { value: "applications_support", label: "Applications Support" },
          { value: "ehr_support", label: "EHR/EMR Support" },
          { value: "clinical_engineering", label: "Clinical Engineering (Biomedical)" },
          { value: "imaging_it", label: "Imaging/Radiology IT" },
          { value: "telecom_voip", label: "Telecommunications/VoIP" },
          { value: "identity_access", label: "Identity & Access Management" },
          { value: "database_reporting", label: "Database & Reporting" },
          { value: "devops_platform", label: "DevOps/Platform" },
          { value: "it_management_pmo", label: "IT Management/PMO" },
          { value: "other", label: "Other" },
        ])
      } finally {
        setLoadingDepartments(false)
      }
    }
    fetchDepartments()
  }, [])

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (!formData.confirm_password) newErrors.confirm_password = "Please confirm your password"
    if (!formData.department) newErrors.department = "Please select a department"
    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required"
    if (!formData.employee_id.trim()) newErrors.employee_id = "Employee ID is required"

    // Username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long"
    }
    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }
    if (formData.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    // Password confirmation
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    // Phone number validation
    if (formData.phone_number && !/^\+?1?\d{9,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await apiService.register(formData)
      setSuccess(true)
    } catch (err) {
      if (err.response?.data) {
        // Handle field-specific errors from backend
        const backendErrors = err.response.data
        if (typeof backendErrors === 'object') {
          setErrors(backendErrors)
        } else {
          setErrors({ general: backendErrors.message || "Registration failed" })
        }
      } else {
        setErrors({ general: "Registration failed. Please try again." })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md bg-white border border-gray-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Your IT support account has been created successfully. Please check your email to verify your account before logging in.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your account is pending approval from a system administrator. You will be notified via email once approved and can then access the IT support system.
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-8">
      <Card className="w-full max-w-2xl bg-white border border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create IT Support Account</CardTitle>
          <p className="text-gray-600">Join the IT helpdesk system to submit requests and get support</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-700">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`bg-white border ${errors.first_name ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter your first name"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-700">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`bg-white border ${errors.last_name ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter your last name"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`bg-white border ${errors.email ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-gray-700">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`bg-white border ${errors.phone_number ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter your phone number"
                />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">{errors.phone_number}</p>
                )}
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">Work Information</h3>
                <WrenchScrewdriverIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-700">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                    <SelectTrigger className={`bg-white border ${errors.department ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-destructive">{errors.department}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employee_id" className="text-gray-700">Employee ID *</Label>
                  <Input
                    id="employee_id"
                    name="employee_id"
                    type="text"
                    value={formData.employee_id}
                    onChange={handleChange}
                    className={`bg-white border ${errors.employee_id ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter your employee ID"
                  />
                  {errors.employee_id && (
                    <p className="text-sm text-destructive">{errors.employee_id}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                <UserPlusIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`bg-white border ${errors.username ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pr-10 bg-white border ${errors.password ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-gray-700">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`pr-10 bg-white border ${errors.confirm_password ? "border-destructive" : "border-gray-300"} text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-destructive">{errors.confirm_password}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <ShieldCheckIcon className="w-3 h-3 mr-1" />
              <span>All accounts require administrator approval</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
