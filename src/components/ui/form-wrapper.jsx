import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Alert, AlertDescription } from './alert'
import { Button } from './button'
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

const FormWrapper = ({ 
  title, 
  description, 
  icon: Icon,
  children, 
  onSubmit, 
  loading = false, 
  error = '', 
  success = '', 
  info = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  className = '',
  headerClassName = '',
  contentClassName = '',
  showSubmitButton = true,
  showCancelButton = false,
  submitDisabled = false,
  variant = 'default' // 'default', 'compact', 'full-width'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'w-full max-w-md'
      case 'full-width':
        return 'w-full'
      default:
        return 'w-full max-w-2xl'
    }
  }

  return (
    <Card className={`${getVariantClasses()} bg-white border border-gray-200 shadow-sm ${className}`}>
      <CardHeader className={`text-center ${headerClassName}`}>
        {Icon && (
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
        {title && (
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
        )}
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className={contentClassName}>
        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        
        {info && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <InformationCircleIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">{info}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {children}
          
          {(showSubmitButton || showCancelButton) && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {showSubmitButton && (
                <Button
                  type="submit"
                  disabled={loading || submitDisabled}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? 'Processing...' : submitText}
                </Button>
              )}
              
              {showCancelButton && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {cancelText}
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default FormWrapper
