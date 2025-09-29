// Enhanced API service with all new endpoints
import { apiService } from './api'

class EnhancedApiService {
  // Bulk Operations
  async bulkAssignRequests(requestIds, assignedToId) {
    const response = await fetch('/api/core/bulk-operations/bulk_assign_requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        request_ids: requestIds,
        assigned_to_id: assignedToId
      })
    })
    return response.json()
  }

  async bulkUpdatePriority(objectIds, objectType, priority) {
    const response = await fetch('/api/core/bulk-operations/bulk_update_priority/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        object_ids: objectIds,
        object_type: objectType,
        priority: priority
      })
    })
    return response.json()
  }

  async bulkCloseRequests(requestIds, resolutionNotes) {
    const response = await fetch('/api/core/bulk-operations/bulk_close_requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        request_ids: requestIds,
        resolution_notes: resolutionNotes
      })
    })
    return response.json()
  }

  async bulkUpdateEquipmentStatus(equipmentIds, status, notes = '') {
    const response = await fetch('/api/core/bulk-operations/bulk_update_equipment_status/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        equipment_ids: equipmentIds,
        status: status,
        notes: notes
      })
    })
    return response.json()
  }

  // Advanced Search
  async globalSearch(query, limit = 50) {
    const response = await fetch(`/api/core/search/global_search/?q=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  // Reporting
  async getDashboardReport(days = 30) {
    const response = await fetch(`/api/core/reports/dashboard_report/?days=${days}`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  async getEquipmentReport(days = 30) {
    const response = await fetch(`/api/core/reports/equipment_report/?days=${days}`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  async getUserActivityReport(days = 30, userId = null) {
    let url = `/api/core/reports/user_activity_report/?days=${days}`
    if (userId) {
      url += `&user_id=${userId}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  async exportData(modelType = 'request', format = 'csv') {
    const response = await fetch(`/api/core/reports/export_data/?model=${modelType}&format=${format}`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    
    if (format === 'csv') {
      const blob = await response.blob()
      return blob
    }
    return response.json()
  }

  // Activity Logs
  async getMyActivity(limit = 50, actionTypes = []) {
    let url = `/api/core/activity-logs/my_activity/?limit=${limit}`
    if (actionTypes.length > 0) {
      url += `&action_types=${actionTypes.join(',')}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  async getSystemActivity(hours = 24, severity = null) {
    let url = `/api/core/activity-logs/system_activity/?hours=${hours}`
    if (severity) {
      url += `&severity=${severity}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  // Import/Export
  async importEquipmentData(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/core/import/equipment/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      },
      body: formData
    })
    return response.json()
  }

  // System Health
  async getSystemHealth() {
    const response = await fetch('/api/core/system/health/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  // File Upload Helper
  async uploadFile(file, endpoint = '/api/files/upload/') {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      },
      body: formData
    })
    return response.json()
  }

  // Batch Operations Helper
  async performBatchOperation(operation, items, options = {}) {
    const operations = {
      'assign_requests': (items, opts) => this.bulkAssignRequests(items, opts.assignedToId),
      'update_priority': (items, opts) => this.bulkUpdatePriority(items, opts.objectType, opts.priority),
      'close_requests': (items, opts) => this.bulkCloseRequests(items, opts.resolutionNotes),
      'update_equipment_status': (items, opts) => this.bulkUpdateEquipmentStatus(items, opts.status, opts.notes)
    }
    
    const operationFn = operations[operation]
    if (!operationFn) {
      throw new Error(`Unknown batch operation: ${operation}`)
    }
    
    return operationFn(items, options)
  }

  // Download Helper
  async downloadFile(url, filename) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Real-time Collaboration
  async getCollaborationData(objectType, objectId) {
    // This would integrate with WebSocket for real-time updates
    const endpoints = {
      'request': `/api/requests/support-requests/${objectId}/`,
      'task': `/api/tasks/tasks/${objectId}/`
    }
    
    const response = await fetch(endpoints[objectType], {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  // Mobile-specific endpoints
  async getMobileData(dataType, filters = {}) {
    const params = new URLSearchParams(filters).toString()
    const endpoints = {
      'dashboard': '/api/analytics/dashboard/',
      'my_requests': '/api/requests/support-requests/',
      'my_tasks': '/api/tasks/tasks/my_tasks/',
      'notifications': '/api/notifications/'
    }
    
    const url = `${endpoints[dataType]}${params ? `?${params}` : ''}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  // Analytics and Insights
  async getAnalyticsInsights(type = 'dashboard', period = 30) {
    const endpoints = {
      'dashboard': `/api/core/reports/dashboard_report/?days=${period}`,
      'equipment': `/api/core/reports/equipment_report/?days=${period}`,
      'activity': `/api/core/reports/user_activity_report/?days=${period}`
    }
    
    const response = await fetch(endpoints[type], {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  // Workflow Management
  async getWorkflowStatus(objectType, objectId) {
    // Get workflow status and next steps
    const response = await fetch(`/api/core/activity-logs/?content_type=${objectType}&object_id=${objectId}`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }

  // Performance Metrics
  async getPerformanceMetrics(metricType = 'all', period = 30) {
    const response = await fetch(`/api/analytics/performance/?type=${metricType}&days=${period}`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  }
}

// Create singleton instance
const enhancedApiService = new EnhancedApiService()

// Export both the class and instance
export { EnhancedApiService, enhancedApiService }
export default enhancedApiService
