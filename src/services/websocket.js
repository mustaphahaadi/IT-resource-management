class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.listeners = new Map()
    this.isConnected = false
    this.disableUntil = 0 // timestamp in ms when we can try again
    this.firstErrorLogged = false
  }

  connect() {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.warn('No auth token found, cannot connect to WebSocket')
      return
    }

    // Feature flag to fully disable WS in dev if backend WS server isn't running
    // Default is disabled unless explicitly enabled
    const enabled = String(import.meta?.env?.VITE_WS_ENABLED ?? 'false') === 'true'
    if (!enabled) {
      if (!this.firstErrorLogged) {
        console.debug('WebSocket disabled via VITE_WS_ENABLED=false. Real-time features are off.')
        this.firstErrorLogged = true
      }
      return
    }

    // Honor cooldown if we recently failed to connect
    const now = Date.now()
    if (this.disableUntil && now < this.disableUntil) {
      if (!this.firstErrorLogged) {
        const seconds = Math.ceil((this.disableUntil - now) / 1000)
        console.debug(`WebSocket temporarily disabled (${seconds}s remaining).`)
        this.firstErrorLogged = true
      }
      return
    }

    // Build URL from env or location. Prefer VITE_WS_URL; fallback to current host.
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const base = import.meta?.env?.VITE_WS_URL || `${protocol}://${window.location.host}/ws/notifications/`
    const wsUrl = `${base}?token=${token}`
    
    try {
      this.socket = new WebSocket(wsUrl)
      
      this.socket.onopen = () => {
        console.debug('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected')
        this.firstErrorLogged = false
      }

      this.socket.onmessage = (event) => {
        try {
          if (typeof event.data !== 'string') {
            console.warn('WebSocket: Non-string message received, ignoring')
            return
          }
          const data = JSON.parse(event.data)
          if (!data || typeof data !== 'object') {
            console.warn('WebSocket: Invalid message format')
            return
          }
          this.handleMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.socket.onclose = (event) => {
        this.isConnected = false
        this.emit('disconnected')
        
        // Only attempt reconnection if it wasn't a normal close and we haven't exceeded max attempts
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('WebSocket: Max reconnection attempts reached. Real-time features disabled for 10 minutes.')
          // Cooldown for 10 minutes to avoid repeated browser error logs
          this.disableUntil = Date.now() + 10 * 60 * 1000
        }
      }

      this.socket.onerror = (error) => {
        // Suppress repeated error logging for connection refused (when WebSocket server is not available)
        if (!this.firstErrorLogged) {
          console.warn('WebSocket server not available. Real-time features disabled.')
          this.firstErrorLogged = true
        }
        // Back off immediately without more attempts in this cycle
        this.disableUntil = Date.now() + 10 * 60 * 1000
        this.emit('error', error)
      }

    } catch (error) {
      console.warn('WebSocket not available:', error.message)
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
    
    // Only log reconnection attempts after the first few to reduce console spam
    if (this.reconnectAttempts <= 2) {
      console.debug(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    }
    
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
        console.debug('Unknown message type:', type, payload)
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
    // Return unsubscribe function for cleanup
    return () => this.off(event, callback)
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
    return this.on('notification', callback)
  }

  onRequestUpdate(callback) {
    return this.on('requestUpdate', callback)
  }

  onTaskUpdate(callback) {
    return this.on('taskUpdate', callback)
  }

  onEquipmentUpdate(callback) {
    return this.on('equipmentUpdate', callback)
  }

  onSystemAlert(callback) {
    return this.on('systemAlert', callback)
  }

  onUserActivity(callback) {
    return this.on('userActivity', callback)
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
