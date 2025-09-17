import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { apiService } from "../services/api"
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from "@heroicons/react/24/outline"

const VerifyEmail = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setError("Invalid verification link")
      setLoading(false)
    }
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await apiService.verifyEmail(token)
      setSuccess(true)
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Email verification failed. The link may be invalid or expired.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResending(true)
    try {
      await apiService.resendVerificationEmail()
      setError("")
      // Show success message
      alert("Verification email sent! Please check your inbox.")
    } catch (err) {
      setError("Failed to resend verification email. Please try again later.")
    } finally {
      setResending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ArrowPathIcon className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Verifying Email</h2>
                <p className="text-muted-foreground">Please wait while we verify your email address...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            <CardTitle className="text-2xl font-bold text-foreground">Email Verified!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Your email address has been successfully verified. You can now access all features of your account.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your account is now active and ready to use.
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Continue to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Verification Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This could happen if:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>The verification link has expired</li>
                <li>The link has already been used</li>
                <li>The link is malformed or invalid</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleResendVerification} 
                disabled={resending}
                className="w-full"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </Button>
              
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact your IT administrator for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail
