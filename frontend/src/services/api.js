import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api"

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
        if (token) {
          config.headers.Authorization = `Token ${token}`
        }
        return config
      },
      (error) => {
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
    const response = await this.post("/auth/login/", credentials)
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token)
    }
    return response
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

  async deleteEquipment(id) {
    return this.delete(`/inventory/equipment/${id}/`)
  }

  // Support Requests API methods
  async getSupportRequests(params = {}) {
    return this.get("/requests/support-requests/", { params })
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

  // Tasks API methods
  async getTasks(params = {}) {
    return this.get("/tasks/tasks/", { params })
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

  async startTask(id) {
    return this.post(`/tasks/tasks/${id}/start/`)
  }

  async completeTask(id, completionNotes = "", actualHours = null) {
    return this.post(`/tasks/tasks/${id}/complete/`, {
      completion_notes: completionNotes,
      actual_hours: actualHours,
    })
  }

  // Personnel API methods
  async getPersonnel(params = {}) {
    return this.get("/tasks/personnel/", { params })
  }

  async getAvailablePersonnel() {
    return this.get("/tasks/personnel/available/")
  }

  // Alerts API methods
  async getAlerts(params = {}) {
    return this.get("/requests/alerts/", { params })
  }

  async acknowledgeAlert(id) {
    return this.post(`/requests/alerts/${id}/acknowledge/`)
  }
}

export const apiService = new ApiService()
export default apiService
