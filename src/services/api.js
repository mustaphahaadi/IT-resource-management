import axios from "axios"

// Prefer env-configured API base; fallback to relative '/api' (proxied in dev)
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || "/api"

class ApiService {
  constructor() {
    this.client = axios.create({
  baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken")
        console.log('API Request:', config.url, 'Token exists:', !!token)
        if (token) {
          config.headers.Authorization = `Token ${token}`
        } else {
          console.warn('No auth token found in localStorage')
        }
        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      },
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken")
          window.location.href = "/login"
        }
        return Promise.reject(error)
      },
    )
  }

  // Duplicate endpoints removed: analytics, alerts, quick-actions, and reports
  // Consolidated canonical implementations are defined in dedicated sections below.

  // Generic HTTP methods
  async get(url, config = {}) {
    return this.client.get(url, config)
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config)
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config)
  }

  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config)
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config)
  }

  // Authentication methods
  async login(credentials) {
    // Align payload with backend serializer: expects email, password, remember_me
    const { email, password } = credentials
    const remember_me = Boolean(credentials.remember_me ?? credentials.rememberMe ?? false)
    const response = await this.client.post("/auth/login/", { email, password, remember_me })
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token)
    }
    return response
  }

  async register(userData) {
    return this.client.post("/auth/register/", userData)
  }

  async requestPasswordReset(email) {
    return this.client.post("/auth/request-password-reset/", { email })
  }

  async resetPassword(token, newPassword, confirmPassword) {
    return this.client.post("/auth/reset-password/", {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  }

  async verifyEmail(token) {
    return this.client.post("/auth/verify-email/", { token })
  }

  async resendVerificationEmail() {
    return this.client.post("/auth/resend-verification/")
  }

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return this.client.post("/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  }

  async updateProfile(profileData) {
    return this.client.put("/auth/profile/update/", profileData)
  }

  // Admin API methods
  async getUsers(params = {}) {
    return this.get("/auth/admin/users/", { params })
  }

  async getUserDetails(userId) {
    return this.get(`/auth/admin/users/${userId}/`)
  }

  async updateUser(userId, userData) {
    return this.put(`/auth/admin/users/${userId}/update/`, userData)
  }

  async approveUser(userId) {
    return this.post(`/auth/admin/users/${userId}/approve/`)
  }

  async disapproveUser(userId) {
    return this.post(`/auth/admin/users/${userId}/disapprove/`)
  }

  async activateUser(userId) {
    return this.post(`/auth/admin/users/${userId}/activate/`)
  }

  async deactivateUser(userId) {
    return this.post(`/auth/admin/users/${userId}/deactivate/`)
  }

  async unlockUserAccount(userId) {
    return this.post(`/auth/admin/users/${userId}/unlock/`)
  }

  async deleteUser(userId) {
    return this.delete(`/auth/admin/users/${userId}/delete/`)
  }

  async getAdminStatistics() {
    return this.get("/auth/admin/statistics/")
  }

  async getRecentLoginAttempts(limit = 50) {
    return this.get("/auth/admin/login-attempts/", { params: { limit } })
  }

  async logout() {
    try {
      await this.post("/auth/logout/")
    } finally {
      localStorage.removeItem("authToken")
    }
  }

  // Equipment API methods
  async getEquipment(params = {}) {
    return this.get("/inventory/equipment/", { params })
  }

  async createEquipment(data) {
    return this.post("/inventory/equipment/", data)
  }

  async updateEquipment(id, data) {
    return this.patch(`/inventory/equipment/${id}/`, data)
  }

  async getEquipmentById(id) {
    return this.get(`/inventory/equipment/${id}/`)
  }

  async deleteEquipment(id) {
    return this.delete(`/inventory/equipment/${id}/`)
  }

  async getEquipmentStats() {
    return this.get("/inventory/equipment/dashboard_stats/")
  }

  // Support Requests API methods
  async getSupportRequests(params = {}) {
    return this.get("/requests/support-requests/", { params })
  }

  async getSupportRequest(id) {
    return this.get(`/requests/support-requests/${id}/`)
  }

  async createSupportRequest(data) {
    return this.post("/requests/support-requests/", data)
  }

  async updateSupportRequest(id, data) {
    return this.patch(`/requests/support-requests/${id}/`, data)
  }

  async assignRequest(id, assignedTo) {
    return this.post(`/requests/support-requests/${id}/assign/`, { assigned_to: assignedTo })
  }

  async addRequestComment(id, comment, isInternal = false) {
    return this.post(`/requests/support-requests/${id}/add_comment/`, {
      comment,
      is_internal: isInternal,
    })
  }

  async getRequestStats() {
    return this.get("/requests/support-requests/dashboard_stats/")
  }

  // Tasks API methods
  async getTasks(params = {}) {
    return this.get("/tasks/tasks/", { params })
  }

  async getTask(id) {
    return this.get(`/tasks/tasks/${id}/`)
  }

  async createTask(data) {
    return this.post("/tasks/tasks/", data)
  }
  async updateTask(id, data) {
    return this.patch(`/tasks/tasks/${id}/`, data)
  }

  async assignTask(id, personnelId) {
    return this.post(`/tasks/tasks/${id}/assign/`, { personnel_id: personnelId })
  }

  async reassignTask(id, personnelId, reason = '') {
    return this.post(`/tasks/tasks/${id}/reassign/`, { 
      personnel_id: personnelId,
      reason: reason
    })
  }

  async createTaskFromRequest(requestId, taskData = {}) {
    return this.post('/tasks/tasks/create_from_request/', {
      request_id: requestId,
      ...taskData
    })
  }

  async getMyTasks(statusFilter = null) {
    const params = statusFilter ? { status: statusFilter } : {}
    return this.get('/tasks/tasks/my_tasks/', { params })
  }

  async getTechnicianDashboard() {
    return this.get('/tasks/tasks/my_dashboard/')
  }

  async getAssignmentSuggestions(taskId = null, department = null, skill = null) {
    const params = {}
    if (taskId) params.task_id = taskId
    if (department) params.department = department
    if (skill) params.skill = skill
    
    return this.get('/tasks/tasks/assignment_suggestions/', { params })
  }

  async startTask(id) {
    return this.post(`/tasks/tasks/${id}/start/`)
  }

  async completeTask(id, completionNotes = "", actualHours = null) {
    return this.post(`/tasks/tasks/${id}/complete/`, {
      completion_notes: completionNotes,
      actual_hours: actualHours,
    })
  }

  async getTaskComments(id, params = {}) {
    return this.get(`/tasks/tasks/${id}/comments/`, { params })
  }

  async addTaskComment(id, comment) {
    return this.post(`/tasks/tasks/${id}/comments/`, { comment })
  }

  async getTaskStats() {
    return this.get("/tasks/tasks/dashboard_stats/")
  }

  // Personnel API methods
  async getPersonnel(params = {}) {
    return this.get("/tasks/personnel/", { params })
  }

  async getAvailablePersonnel(department = null, skill = null) {
    const params = {}
    if (department) params.department = department
    if (skill) params.skill = skill
    
    return this.get("/tasks/personnel/available/", { params })
  }

  // Get users for assignment (non-admin endpoint)
  async getUsersForAssignment(params = {}) {
    return this.get("/auth/users/assignable/", { params })
  }

  // Get all active users (for dropdowns)
  async getActiveUsers(params = {}) {
    return this.get("/auth/users/active/", { params })
  }

  async createPersonnel(data) {
    return this.post("/tasks/personnel/", data)
  }

  async updatePersonnel(id, data) {
    return this.patch(`/tasks/personnel/${id}/`, data)
  }

  async deletePersonnel(id) {
    return this.delete(`/tasks/personnel/${id}/`)
  }

  // Alerts API methods
  async getAlerts(params = {}) {
    return this.get("/requests/alerts/", { params })
  }

  async acknowledgeAlert(id) {
    return this.post(`/requests/alerts/${id}/acknowledge/`)
  }

  // Analytics API methods
  async getDashboardAnalytics() {
    return this.get("/analytics/dashboard/")
  }

  async getEquipmentAnalytics(params = {}) {
    return this.get("/analytics/equipment/", { params })
  }

  async getRequestAnalytics(params = {}) {
    return this.get("/analytics/requests/", { params })
  }

  async getTaskAnalytics(params = {}) {
    return this.get("/analytics/tasks/", { params })
  }

  async getDepartmentAnalytics(params = {}) {
    return this.get("/analytics/departments/", { params })
  }

  async getPerformanceMetrics(params = {}) {
    return this.get("/analytics/performance/", { params })
  }

  async getSystemHealth() {
    return this.get("/analytics/system-health/")
  }

  async getRecentActivity(params = {}) {
    return this.get("/analytics/recent-activity/", { params })
  }

  // Reports API methods
  async generateReport(reportType, params = {}) {
    return this.post("/reports/generate/", { report_type: reportType, ...params })
  }

  async getReportHistory(params = {}) {
    return this.get("/reports/history/", { params })
  }

  async downloadReport(reportId, format = 'pdf') {
    return this.get(`/reports/${reportId}/download/`, { responseType: 'blob', params: { format } })
  }

  async scheduleReport(reportConfig) {
    return this.post("/reports/schedule/", reportConfig)
  }

  // Categories & Taxonomy API methods
  async getCategories(type = null) {
    const params = type ? { type } : {}
    return this.get("/inventory/categories/", { params })
  }

  async getRequestCategories(params = {}) {
    return this.get("/requests/categories/", { params })
  }

  async getLocations() {
    return this.get("/inventory/locations/")
  }

  async getDepartments() {
    return this.get("/inventory/departments/")
  }

  async getVendors() {
    return this.get("/inventory/vendors/")
  }

  // Notifications API methods
  async getNotifications(params = {}) {
    return this.get("/notifications/", { params })
  }

  async markNotificationRead(id) {
    return this.post(`/notifications/${id}/read/`)
  }

  async markAllNotificationsRead() {
    return this.post("/notifications/mark-all-read/")
  }

  async dismissNotification(id) {
    return this.delete(`/notifications/${id}/dismiss/`)
  }

  async getNotificationPreferences() {
    return this.get("/notifications/preferences/")
  }

  async updateNotificationPreferences(preferences) {
    return this.put("/notifications/preferences/", preferences)
  }

  // File upload methods
  async uploadFile(file, type = 'general') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return this.post("/files/upload/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // Search methods
  async globalSearch(query, filters = {}) {
    return this.get("/search/", { params: { q: query, ...filters } })
  }

  // User profile methods
  async getCurrentUser() {
    return this.get("/auth/user/")
  }

  async getUserPreferences() {
    return this.get("/auth/user/preferences/")
  }

  async updateUserPreferences(preferences) {
    return this.patch("/auth/user/preferences/", preferences)
  }

  async getUserStats() {
    return this.get("/auth/user/stats/")
  }

  async getUserActivity(params = {}) {
    return this.get("/auth/user/activity/", { params })
  }

  // System settings methods (admin only)
  async getSystemSettings() {
    return this.get("/admin/settings/")
  }

  async updateSystemSettings(settings) {
    return this.patch("/admin/settings/", settings)
  }

  // Audit log methods
  async getAuditLogs(params = {}) {
    return this.get("/admin/audit-logs/", { params })
  }

  // Backup methods
  async getBackupHistory() {
    return this.get("/admin/backup/history/")
  }
  async createBackup() {
    return this.post("/admin/backup/create/")
  }

  async deleteBackup(backupId) {
    return this.delete(`/admin/backup/${backupId}/`)
  }

  async restoreBackup(backupId) {
    return this.post(`/admin/backup/${backupId}/restore/`)
  }

  async downloadBackup(backupId) {
    return this.get(`/admin/backup/${backupId}/download/`, { responseType: 'blob' })
  }
}

export const apiService = new ApiService()
export default apiService
