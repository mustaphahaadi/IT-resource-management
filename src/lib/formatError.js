export function formatServerError(data, fallbackMessage = 'An error occurred') {
  if (!data) return fallbackMessage
  if (typeof data === 'string') return data
  if (data.message) return data.message
  if (typeof data === 'object') {
    try {
      const parts = []
      for (const [k, v] of Object.entries(data)) {
        if (Array.isArray(v)) parts.push(`${k}: ${v.join('; ')}`)
        else if (typeof v === 'object') parts.push(`${k}: ${JSON.stringify(v)}`)
        else parts.push(`${k}: ${v}`)
      }
      return parts.join(' | ')
    } catch (e) {
      return JSON.stringify(data)
    }
  }
  return String(data)
}
