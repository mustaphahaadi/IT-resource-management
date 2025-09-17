import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import {
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  filterConfig, 
  showSearch = true,
  showDateRange = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  useEffect(() => {
    setLocalFilters(filters)
    setSearchTerm(filters.search || '')
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    const newFilters = { ...localFilters, search: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {})
    setLocalFilters(clearedFilters)
    setSearchTerm('')
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => value && value !== '').length
  }

  const renderFilterField = (config) => {
    const { key, type, label, options, placeholder } = config

    switch (type) {
      case 'select':
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
              value={localFilters[key] || ''}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{placeholder || `All ${label}`}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'multiselect':
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {options.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(localFilters[key] || []).includes(option.value)}
                    onChange={(e) => {
                      const currentValues = localFilters[key] || []
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value)
                      handleFilterChange(key, newValues)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'date':
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={localFilters[key] || ''}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )

      case 'daterange':
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={localFilters[`${key}_start`] || ''}
                  onChange={(e) => handleFilterChange(`${key}_start`, e.target.value)}
                  placeholder="Start date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={localFilters[`${key}_end`] || ''}
                  onChange={(e) => handleFilterChange(`${key}_end`, e.target.value)}
                  placeholder="End date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      case 'number':
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="number"
              value={localFilters[key] || ''}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={`bg-white shadow-sm border border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-blue-600" />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Search Field */}
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filterConfig
              .filter(config => !config.advanced)
              .map(renderFilterField)}
          </div>

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterConfig
                  .filter(config => config.advanced)
                  .map(renderFilterField)}
              </div>
            </div>
          )}

          {/* Date Range (if enabled) */}
          {showDateRange && isExpanded && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date From</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={localFilters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date To</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={localFilters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AdvancedFilters
