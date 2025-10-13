import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

// Simple in-memory cache for option lists keyed by endpoint
const optionsCache = new Map()

export default function useOptions(endpoint, mapFn = null, deps = [], opts = {}) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cacheTTL = typeof opts.cacheTTL === 'number' ? opts.cacheTTL : 5 * 60 * 1000 // default 5 minutes

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      setLoading(true)
      setError('')
      try {
        // Check cache first
        if (endpoint && optionsCache.has(endpoint)) {
          const entry = optionsCache.get(endpoint)
          if (Date.now() - entry.ts < cacheTTL) {
            const cached = entry.data
            const mapped = mapFn ? cached.map(mapFn) : cached
            if (mounted) setOptions(mapped)
            setLoading(false)
            return
          }
        }

        const res = await apiService.get(endpoint)
        let list = []
        if (res && res.data) {
          // try common shapes
          if (Array.isArray(res.data)) list = res.data
          else if (Array.isArray(res.data.results)) list = res.data.results
          else if (Array.isArray(res.data.roles)) list = res.data.roles
          else if (Array.isArray(res.data.choices)) list = res.data.choices
          else if (Array.isArray(res.data.categories)) list = res.data.categories
          else if (Array.isArray(res.data.departments)) list = res.data.departments
          else if (Array.isArray(res.data.priorities)) list = res.data.priorities
          else if (Array.isArray(res.data.statuses)) list = res.data.statuses
          else if (Array.isArray(res.data.channels)) list = res.data.channels
          else list = []
        }

        // Cache the raw list (before mapping) to reuse for other callers
        if (endpoint) optionsCache.set(endpoint, { ts: Date.now(), data: list })

        if (mapFn) list = list.map(mapFn)
        if (mounted) setOptions(list)
      } catch (err) {
        setError('Failed to load options')
        console.error('useOptions error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (endpoint) fetch()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { options, loading, error }
}
