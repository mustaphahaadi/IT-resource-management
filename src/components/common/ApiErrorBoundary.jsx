import React from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-4">
                  <p className="font-medium">Something went wrong</p>
                  <p className="text-sm">{this.state.error?.message || 'An unexpected error occurred'}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Reload Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ApiErrorBoundary
