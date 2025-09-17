class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.listeners = new Map()
    this.isConnected = false
  }

  connect() {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.warn('No auth token found, cannot connect to WebSocket')
      return
    }

    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`
    
    try {
      this.socket = new WebSocket(wsUrl)
      
      this.socket.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected')
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.isConnected = false
        this.emit('disconnected')
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
      this.isConnected = false
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    setTimeout(() => {
      this.connect()
    }, this.reconnectInterval * this.reconnectAttempts)
  }

  handleMessage(data) {
    const { type, payload } = data
    
    switch (type) {
      case 'notification':
        this.emit('notification', payload)
        break
      case 'request_update':
        this.emit('requestUpdate', payload)
        break
      case 'task_update':
        this.emit('taskUpdate', payload)
        break
      case 'equipment_update':
        this.emit('equipmentUpdate', payload)
        break
      case 'system_alert':
        this.emit('systemAlert', payload)
        break
      case 'user_activity':
        this.emit('userActivity', payload)
        break
      default:
        console.log('Unknown message type:', type, payload)
    }
  }

  send(type, payload) {
    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify({ type, payload }))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in WebSocket event callback:', error)
        }
      })
    }
  }

  // Convenience methods for specific events
  onNotification(callback) {
    this.on('notification', callback)
  }

  onRequestUpdate(callback) {
    this.on('requestUpdate', callback)
  }

  onTaskUpdate(callback) {
    this.on('taskUpdate', callback)
  }

  onEquipmentUpdate(callback) {
    this.on('equipmentUpdate', callback)
  }

  onSystemAlert(callback) {
    this.on('systemAlert', callback)
  }

  onUserActivity(callback) {
    this.on('userActivity', callback)
  }

  // Send specific message types
  joinRoom(roomName) {
    this.send('join_room', { room: roomName })
  }

  leaveRoom(roomName) {
    this.send('leave_room', { room: roomName })
  }

  sendHeartbeat() {
    this.send('heartbeat', { timestamp: Date.now() })
  }

  // Auto-heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat()
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()
export default websocketService
