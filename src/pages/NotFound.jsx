import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { 
  HomeIcon, 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline"

const NotFound = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-foreground">404</h1>
              <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Here are some helpful links:</p>
              <div className="flex flex-col space-y-2">
                <Button onClick={handleGoBack} variant="outline" className="w-full">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Link to="/" className="w-full">
                  <Button className="w-full">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Additional Help */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                If you believe this is an error, please contact your IT administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFound
