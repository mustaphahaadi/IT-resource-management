import React, { useState, useMemo, useEffect, useRef } from 'react'

function debounce(fn, wait) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const AsyncSelect = ({
  options = [],
  loading = false,
  error = '',
  value,
  onChange,
  placeholder = 'Select...',
  name,
  id,
  className = '',
  disabled = false,
  searchable = false,
  onSearch = null,
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('')
  const [remoteLoading, setRemoteLoading] = useState(false)
  const [remoteError, setRemoteError] = useState('')
  const [remoteOptions, setRemoteOptions] = useState([])
  const isMounted = useRef(true)

  useEffect(() => () => { isMounted.current = false }, [])

  // merged options: prefer remoteOptions when onSearch is provided and query is non-empty, else local props.options
  const mergedOptions = useMemo(() => {
    if (onSearch && query.trim().length > 0) return remoteOptions
    if (searchable && query.trim().length > 0) {
      const q = query.toLowerCase()
      return (options || []).filter(o => (o.label || String(o.value || '')).toLowerCase().includes(q))
    }
    return options || []
  }, [options, remoteOptions, onSearch, query, searchable])

  useEffect(() => {
    if (!onSearch) return
    if (!query || query.trim().length === 0) {
      setRemoteOptions([])
      setRemoteError('')
      setRemoteLoading(false)
      return
    }
    const callSearch = debounce(async (q) => {
      setRemoteLoading(true)
      setRemoteError('')
      try {
        const res = await onSearch(q)
        if (!isMounted.current) return
        // support both direct array or {results: []}
        const data = Array.isArray(res) ? res : (res?.results || res?.data || [])
        setRemoteOptions(data)
      } catch (e) {
        console.error('AsyncSelect remote search error', e)
        if (isMounted.current) setRemoteError('Search failed')
      } finally {
        if (isMounted.current) setRemoteLoading(false)
      }
    }, debounceMs)

    callSearch(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, onSearch])

  // If not searchable, render a native select same as before
  if (!searchable) {
    return (
      <div>
        <select
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
          className={className}
        >
          <option value="">{loading ? 'Loading...' : placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt.id ?? opt.name} value={opt.value ?? opt.id ?? opt.name}>
              {opt.label ?? opt.display_name ?? opt.name}
            </option>
          ))}
        </select>
        {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
      </div>
    )
  }

  // Searchable UI: input + native select for results (keeps accessibility/simple markup)
  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 mb-2 border rounded ${className}`}
      />
      <select
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled || loading || remoteLoading}
        className={className}
      >
        <option value="">{(loading || remoteLoading) ? 'Loading...' : placeholder}</option>
        {mergedOptions.map((opt) => (
          <option key={opt.value ?? opt.id ?? opt.name} value={opt.value ?? opt.id ?? opt.name}>
            {opt.label ?? opt.display_name ?? opt.name}
          </option>
        ))}
      </select>
      {(error || remoteError) && <div className="text-sm text-red-600 mt-1">{error || remoteError}</div>}
    </div>
  )
}

export default AsyncSelect
