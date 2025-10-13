import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { apiService } from '../services/api'
import AsyncSelect from '../components/ui/AsyncSelect'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'all'
  
  const [results, setResults] = useState({
    equipment: [],
    requests: [],
    tasks: [],
    users: [],
    documents: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [filters, setFilters] = useState({
    category: category,
    dateRange: '',
    status: '',
    priority: ''
  })

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query, filters])

  const performSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await apiService.globalSearch(query, filters)
      setResults(response.data.results || {})
      setTotalResults(response.data.total || 0)
    } catch (err) {
      setError('Failed to perform search. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      dateRange: '',
      status: '',
      priority: ''
    })
    setSearchParams({ q: query })
  }

  const getResultIcon = (type) => {
    switch (type) {
      case 'equipment':
        return <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
      case 'requests':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      case 'tasks':
        return <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
      case 'users':
        return <UserIcon className="w-5 h-5 text-purple-600" />
      case 'documents':
        return <DocumentTextIcon className="w-5 h-5 text-orange-600" />
      default:
        return <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getResultLink = (type, item) => {
    switch (type) {
      case 'equipment':
        return `/app/inventory?id=${item.id}`
      case 'requests':
        return `/app/requests?id=${item.id}`
      case 'tasks':
        return `/app/tasks?id=${item.id}`
      case 'users':
        return `/app/admin?tab=users&id=${item.id}`
      default:
        return '#'
    }
  }

  const highlightText = (text, query) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  const ResultItem = ({ type, item }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getResultIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Link
              to={getResultLink(type, item)}
              className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate"
            >
              <span dangerouslySetInnerHTML={{ 
                __html: highlightText(item.title || item.name, query) 
              }} />
            </Link>
            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
              {type}
            </span>
          </div>
          
          {item.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              <span dangerouslySetInnerHTML={{ 
                __html: highlightText(item.description, query) 
              }} />
            </p>
          )}
          
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            {item.status && (
              <span className={`px-2 py-1 rounded-full ${
                item.status === 'active' || item.status === 'resolved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            )}
            {item.priority && (
              <span className={`px-2 py-1 rounded-full ${
                item.priority === 'critical' || item.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : item.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {item.priority} priority
              </span>
            )}
            {item.department && (
              <span>Department: {item.department}</span>
            )}
            {item.updated_at && (
              <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Searching...' : `${totalResults} results for "${query}"`}
          </p>
        </div>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5" />
            <span>Filters</span>
            {Object.values(filters).some(f => f && f !== 'all') && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AsyncSelect
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'requests', label: 'Requests' },
                { value: 'tasks', label: 'Tasks' },
                { value: 'users', label: 'Users' },
                { value: 'documents', label: 'Documents' }
              ]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <AsyncSelect
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'resolved', label: 'Resolved' }
              ]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <AsyncSelect
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <AsyncSelect
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              options={[
                { value: '', label: 'Any Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' }
              ]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Searching..." />
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={performSearch}>Try Again</Button>
          </CardContent>
        </Card>
      ) : totalResults === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <div className="space-x-2">
              <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Equipment Results */}
          {results.equipment?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
                  <span>Equipment ({results.equipment.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.equipment.map((item) => (
                  <ResultItem key={`equipment-${item.id}`} type="equipment" item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Requests Results */}
          {results.requests?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  <span>Support Requests ({results.requests.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.requests.map((item) => (
                  <ResultItem key={`request-${item.id}`} type="requests" item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tasks Results */}
          {results.tasks?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
                  <span>Tasks ({results.tasks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.tasks.map((item) => (
                  <ResultItem key={`task-${item.id}`} type="tasks" item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Users Results */}
          {results.users?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                  <span>Users ({results.users.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.users.map((item) => (
                  <ResultItem key={`user-${item.id}`} type="users" item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Documents Results */}
          {results.documents?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                  <span>Documents ({results.documents.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.documents.map((item) => (
                  <ResultItem key={`document-${item.id}`} type="documents" item={item} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchResults
