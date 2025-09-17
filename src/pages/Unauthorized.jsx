import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { useAuth } from "../contexts/AuthContext"
import { 
  ShieldExclamationIcon, 
  HomeIcon, 
  ArrowLeftIcon,
  UserIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline"

const Unauthorized = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldExclamationIcon className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              You don't have permission to access this resource.
            </p>
            
            {user && (
              <Alert>
                <UserIcon className="h-4 w-4" />
                <AlertDescription>
                  Logged in as: <strong>{user.email}</strong> ({user.role})
                  {!user.is_approved && (
                    <span className="block text-sm text-muted-foreground mt-1">
                      Your account is pending approval from an administrator.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Possible reasons:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Your account doesn't have the required permissions</li>
                <li>Your account is pending administrator approval</li>
                <li>You need to be assigned to a specific role or department</li>
                <li>The resource requires higher access level</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2">
              <Button onClick={handleGoBack} variant="outline" className="w-full">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Link to="/" className="w-full">
                <Button className="w-full">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </Link>
              {user && (
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Switch Account
                </Button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Need access? Contact your IT administrator or system manager for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Unauthorized
