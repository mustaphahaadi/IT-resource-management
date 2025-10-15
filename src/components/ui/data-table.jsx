import React, { useState, memo } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Badge } from './badge'
import StatusBadge from './status-badge'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  actions = [],
  onRowClick,
  onSearch,
  onFilter,
  onSort,
  onSelect,
  emptyMessage = 'No data available',
  className = '',
  pageSize = 10,
  showPagination = true
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    if (onSearch) {
      onSearch(value)
    }
  }

  // Handle filter
  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setCurrentPage(1)
    if (onFilter) {
      onFilter(newFilters)
    }
  }

  // Handle sort
  const handleSort = (key) => {
    if (!sortable) return
    
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    const newSortConfig = { key, direction }
    setSortConfig(newSortConfig)
    
    if (onSort) {
      onSort(newSortConfig)
    }
  }

  // Handle row selection
  const handleRowSelect = (rowId, checked) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(rowId)
    } else {
      newSelected.delete(rowId)
    }
    setSelectedRows(newSelected)
    
    if (onSelect) {
      onSelect(Array.from(newSelected))
    }
  }

  // Handle select all
  const handleSelectAll = (checked) => {
    const newSelected = checked ? new Set(data.map(row => row.id)) : new Set()
    setSelectedRows(newSelected)
    
    if (onSelect) {
      onSelect(Array.from(newSelected))
    }
  }

  // Filter and sort data locally if no external handlers
  let processedData = [...data]

  if (!onSearch && searchTerm) {
    processedData = processedData.filter(row =>
      columns.some(col => {
        const value = row[col.key]
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }

  if (!onFilter && Object.keys(filters).length > 0) {
    processedData = processedData.filter(row =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true
        return row[key] === value
      })
    )
  }

  if (!onSort && sortConfig.key) {
    processedData.sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = showPagination 
    ? processedData.slice(startIndex, startIndex + pageSize)
    : processedData

  // Render cell content
  const renderCell = (row, column) => {
    const value = row[column.key]
    
    // If a custom render is provided, use it. If it returns a plain object
    // (not a React element), stringify it to avoid React errors.
    if (column.render) {
      const rendered = column.render(value, row)
      if (rendered && typeof rendered === 'object' && !React.isValidElement(rendered)) {
        try {
          return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(rendered)}</pre>
        } catch (e) {
          return String(rendered)
        }
      }
      return rendered
    }
    
    if (column.type === 'status') {
      return <StatusBadge status={value} type={column.statusType} />
    }
    
    if (column.type === 'badge') {
      return <Badge variant={column.badgeVariant}>{value}</Badge>
    }
    
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '-'
    }
    
    if (column.type === 'datetime') {
      return value ? new Date(value).toLocaleString() : '-'
    }
    
    // Guard against rendering plain objects directly
    if (value && typeof value === 'object' && !React.isValidElement(value)) {
      try {
        return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(value)}</pre>
      } catch (e) {
        return String(value)
      }
    }

    return value || '-'
  }

  // Get filterable columns
  const filterableColumns = columns.filter(col => col.filterable)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {filterable && filterableColumns.length > 0 && (
            <div className="flex gap-2">
              {filterableColumns.map(column => (
                <Select
                  key={column.key}
                  value={filters[column.key] || ''}
                  onValueChange={(value) => handleFilter(column.key, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={`Filter by ${column.title}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All {column.title}</SelectItem>
                    {column.filterOptions?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {selectable && (
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === data.length && data.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  {columns.map(column => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide ${
                        sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.title}
                        {sortable && column.sortable !== false && (
                          <div className="flex flex-col">
                            {sortConfig.key === column.key ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUpIcon className="w-3 h-3" />
                              ) : (
                                <ChevronDownIcon className="w-3 h-3" />
                              )
                            ) : (
                              <ChevronUpDownIcon className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${
                      selectedRows.has(row.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleRowSelect(row.id, e.target.checked)
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    {columns.map(column => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                        {renderCell(row, column)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(row)
                              }}
                              disabled={action.disabled && action.disabled(row)}
                              className="h-8 w-8 p-0"
                            >
                              <action.icon className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedData.length)} of {processedData.length} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(DataTable)
