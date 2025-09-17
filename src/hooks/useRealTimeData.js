import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

export const useRealTimeData = (dataType, fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const { websocketService, isOnline } = useAuth()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchFunction()
      setData(response.data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
      console.error(`Error fetching ${dataType}:`, err)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, dataType])

  // Initial data fetch
  useEffect(() => {
    if (isOnline) {
      fetchData()
    }
  }, [fetchData, isOnline, ...dependencies])

  // Set up real-time updates via WebSocket
  useEffect(() => {
    if (!websocketService || !dataType) return

    const handleUpdate = (payload) => {
      // Update specific item in the data array
      if (Array.isArray(data)) {
        setData(prevData => {
          const updatedData = [...prevData]
          const index = updatedData.findIndex(item => item.id === payload.id)
          
          if (index !== -1) {
            if (payload.action === 'delete') {
              updatedData.splice(index, 1)
            } else {
              updatedData[index] = { ...updatedData[index], ...payload.data }
            }
          } else if (payload.action === 'create') {
            updatedData.unshift(payload.data)
          }
          
          return updatedData
        })
      } else if (data && typeof data === 'object') {
        // Update object data
        setData(prevData => ({ ...prevData, ...payload.data }))
      }
      
      setLastUpdated(new Date())
    }

    // Subscribe to relevant WebSocket events based on data type
    switch (dataType) {
      case 'requests':
        websocketService.onRequestUpdate(handleUpdate)
        break
      case 'tasks':
        websocketService.onTaskUpdate(handleUpdate)
        break
      case 'equipment':
        websocketService.onEquipmentUpdate(handleUpdate)
        break
      case 'dashboard':
        websocketService.on('dashboardUpdate', handleUpdate)
        break
      default:
        websocketService.on(`${dataType}Update`, handleUpdate)
    }

    return () => {
      // Cleanup WebSocket listeners
      websocketService.off(`${dataType}Update`, handleUpdate)
      websocketService.off('requestUpdate', handleUpdate)
      websocketService.off('taskUpdate', handleUpdate)
      websocketService.off('equipmentUpdate', handleUpdate)
      websocketService.off('dashboardUpdate', handleUpdate)
    }
  }, [websocketService, dataType, data])

  // Auto-refresh data when coming back online
  useEffect(() => {
    if (isOnline && !loading && error) {
      fetchData()
    }
  }, [isOnline, loading, error, fetchData])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  const updateItem = useCallback((id, updates) => {
    if (Array.isArray(data)) {
      setData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      )
    }
  }, [data])

  const addItem = useCallback((newItem) => {
    if (Array.isArray(data)) {
      setData(prevData => [newItem, ...prevData])
    }
  }, [data])

  const removeItem = useCallback((id) => {
    if (Array.isArray(data)) {
      setData(prevData => prevData.filter(item => item.id !== id))
    }
  }, [data])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    updateItem,
    addItem,
    removeItem,
    isOnline
  }
}

export default useRealTimeData
