import { useState } from "react"
import { Navigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ComputerDesktopIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

const Login = () => {
  const { user, login } = useAuth()
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  if (user) {
    return <Navigate to="/app/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (loginAttempts >= 5) {
      setError("Too many login attempts. Please wait before trying again.")
      setLoading(false)
      return
    }

    const result = await login({ ...credentials, rememberMe })

    if (!result.success) {
      setError(result.error)
      setLoginAttempts((prev) => prev + 1)
    } else {
      setLoginAttempts(0)
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2F327D] px-4">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#2F327D] rounded-lg flex items-center justify-center">
              <ComputerDesktopIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#2F327D]">Hospital IT System</CardTitle>
          <p className="text-gray-600">Sign in to access the IT management portal</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2F327D] focus:border-[#2F327D]"
                placeholder="Enter your email or username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2F327D] focus:border-[#2F327D]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#2F327D] focus:ring-[#2F327D] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#2F327D] hover:text-[#2F327D]/80">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || loginAttempts >= 5}
              className="w-full bg-[#2F327D] text-white py-2 px-4 rounded-md hover:bg-[#2F327D]/90 focus:outline-none focus:ring-2 focus:ring-[#2F327D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Need access? Contact your IT administrator</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
