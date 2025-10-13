import { useState, useEffect } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

// Validation rules
export const validationRules = {
  required: (value, message = 'This field is required') => {
    return !value || value.toString().trim() === '' ? message : null
  },
  
  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? message : null
  },
  
  phone: (value, message = 'Please enter a valid phone number') => {
    if (!value) return null
    const phoneRegex = /^\+?1?\d{9,15}$/
    return !phoneRegex.test(value.replace(/[\s\-()]/g, '')) ? message : null
  },
  
  minLength: (minLength, message) => (value) => {
    if (!value) return null
    return value.length < minLength ? (message || `Must be at least ${minLength} characters`) : null
  },
  
  maxLength: (maxLength, message) => (value) => {
    if (!value) return null
    return value.length > maxLength ? (message || `Must be no more than ${maxLength} characters`) : null
  },
  
  password: (value, message = 'Password must contain at least 8 characters with uppercase, lowercase, and number') => {
    if (!value) return null
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      return !passwordRegex.test(value) ? message : null
  },
  
  confirmPassword: (originalPassword, message = 'Passwords do not match') => (value) => {
    if (!value || !originalPassword) return null
    return value !== originalPassword ? message : null
  },
  
  number: (value, message = 'Please enter a valid number') => {
    if (!value) return null
    return isNaN(value) ? message : null
  },
  
  positiveNumber: (value, message = 'Please enter a positive number') => {
    if (!value) return null
    const num = parseFloat(value)
    return isNaN(num) || num <= 0 ? message : null
  },
  
  url: (value, message = 'Please enter a valid URL') => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  },
  
  alphanumeric: (value, message = 'Only letters and numbers are allowed') => {
    if (!value) return null
    const alphanumericRegex = /^[a-zA-Z0-9]+$/
    return !alphanumericRegex.test(value) ? message : null
  },
  
  custom: (validatorFn, message) => (value) => {
    if (!value) return null
    return validatorFn(value) ? null : message
  }
}

// Form validation hook
export const useFormValidation = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    validateForm()
  }, [values])

  const validateField = (name, value) => {
    const fieldRules = validationSchema[name]
    if (!fieldRules) return null

    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) return error
    }
    return null
  }

  const validateForm = () => {
    const newErrors = {}
    let formIsValid = true

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        formIsValid = false
      }
    })

    setErrors(newErrors)
    setIsValid(formIsValid)
    return formIsValid
  }

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsValid(false)
  }

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    reset
  }
}

// Validated Input Component
export const ValidatedInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  className = '',
  helpText,
  ...props
}) => {
  const hasError = touched && error
  const inputId = `input-${name}`

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
          `}
          {...props}
        />
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
      
      {helpText && !hasError && (
        <p className="text-sm text-gray-500 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {helpText}
        </p>
      )}
    </div>
  )
}

// Validated Textarea Component
export const ValidatedTextarea = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  helpText,
  maxLength,
  ...props
}) => {
  const hasError = touched && error
  const textareaId = `textarea-${name}`
  const currentLength = value ? value.length : 0

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={textareaId}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors resize-vertical
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
          `}
          {...props}
        />
      </div>
      
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {hasError && (
            <p className="text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          
          {helpText && !hasError && (
            <p className="text-sm text-gray-500 flex items-center">
              <InformationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              {helpText}
            </p>
          )}
        </div>
        
        {maxLength && (
          <p className={`text-xs ml-2 flex-shrink-0 ${
            currentLength > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
          }`}>
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

// Validated Select Component
export const ValidatedSelect = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  helpText,
  ...props
}) => {
  const hasError = touched && error
  const selectId = `select-${name}`

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {hasError && (
          <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
      
      {helpText && !hasError && (
        <p className="text-sm text-gray-500 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {helpText}
        </p>
      )}
    </div>
  )
}

// Form Summary Component
export const FormValidationSummary = ({ errors, touched, className = '' }) => {
  const visibleErrors = Object.keys(errors)
    .filter(key => touched[key] && errors[key])
    .map(key => ({ field: key, message: errors[key] }))

  if (visibleErrors.length === 0) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Please correct the following errors:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {visibleErrors.map(({ field, message }) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Success Message Component
export const FormSuccessMessage = ({ message, className = '' }) => {
  if (!message) return null

  return (
    <div className={`bg-green-50 border border-green-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">{message}</p>
        </div>
      </div>
    </div>
  )
}
