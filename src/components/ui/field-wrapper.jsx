import { Label } from './label'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

const FieldWrapper = ({
  label,
  required = false,
  error = '',
  hint = '',
  children,
  className = '',
  labelClassName = '',
  errorClassName = '',
  hintClassName = '',
  id,
  disabled = false
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label 
          htmlFor={fieldId} 
          className={`block text-sm font-medium ${
            error ? 'text-red-700' : disabled ? 'text-gray-400' : 'text-gray-700'
          } ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {children}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {hint && !error && (
        <p className={`text-xs text-gray-500 ${hintClassName}`}>
          {hint}
        </p>
      )}
      
      {error && (
        <p className={`text-sm text-red-600 flex items-center gap-1 ${errorClassName}`}>
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export default FieldWrapper
