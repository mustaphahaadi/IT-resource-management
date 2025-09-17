import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { 
  ExclamationTriangleIcon, 
  HomeIcon, 
  ArrowPathIcon,
  BugAntIcon 
} from "@heroicons/react/24/outline"

const ServerError = ({ error, resetError }) => {
  const navigate = useNavigate()

  const handleRefresh = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <BugAntIcon className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              We encountered an unexpected error. Our team has been notified and is working to fix this issue.
            </p>
            
            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">Error Details</summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-32 bg-muted p-2 rounded">
                      {error.message || error.toString()}
                    </pre>
                  </details>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">What you can try:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Refresh the page to try again</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try again in a few minutes</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2">
              <Button onClick={handleRefresh} className="w-full">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                <HomeIcon className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              If the problem persists, please contact your IT administrator with the error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ServerError
