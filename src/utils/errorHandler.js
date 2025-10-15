export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage

  const response = error.response?.data
  
  if (typeof response === 'string') return response
  if (response?.message) return response.message
  if (response?.error) return response.error
  if (response?.detail) return response.detail
  
  if (typeof response === 'object') {
    const errors = []
    for (const [key, value] of Object.entries(response)) {
      if (Array.isArray(value)) {
        errors.push(`${key}: ${value.join(', ')}`)
      } else {
        errors.push(`${key}: ${value}`)
      }
    }
    if (errors.length) return errors.join(' | ')
  }
  
  return error.message || defaultMessage
}

export const withErrorHandling = async (fn, setError, setLoading) => {
  try {
    setLoading?.(true)
    setError?.('')
    return await fn()
  } catch (error) {
    const message = handleApiError(error)
    setError?.(message)
    console.error('Error:', error)
    throw error
  } finally {
    setLoading?.(false)
  }
}
