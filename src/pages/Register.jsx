import { useState } from "react"
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
  ExclamationTriangleIcon 
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

  const departments = [
    { value: "it", label: "Information Technology" },
    { value: "admin", label: "Administration" },
    { value: "medical", label: "Medical" },
    { value: "nursing", label: "Nursing" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "laboratory", label: "Laboratory" },
    { value: "radiology", label: "Radiology" },
    { value: "maintenance", label: "Maintenance" },
    { value: "security", label: "Security" },
    { value: "other", label: "Other" }
  ]

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
        <Card className="w-full max-w-md">
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
                Your account has been created successfully. Please check your email to verify your account before logging in.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your account is pending approval from an administrator. You will be notified once approved.
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <UserPlusIcon className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
          <p className="text-muted-foreground">Join the Hospital IT System</p>
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
              <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={errors.first_name ? "border-destructive" : ""}
                    placeholder="Enter your first name"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={errors.last_name ? "border-destructive" : ""}
                    placeholder="Enter your last name"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={errors.phone_number ? "border-destructive" : ""}
                  placeholder="Enter your phone number"
                />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">{errors.phone_number}</p>
                )}
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                    <SelectTrigger className={errors.department ? "border-destructive" : ""}>
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
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    name="employee_id"
                    type="text"
                    value={formData.employee_id}
                    onChange={handleChange}
                    className={errors.employee_id ? "border-destructive" : ""}
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
              <h3 className="text-lg font-medium text-foreground">Account Information</h3>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "border-destructive" : ""}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
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
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={errors.confirm_password ? "border-destructive pr-10" : "pr-10"}
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

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
