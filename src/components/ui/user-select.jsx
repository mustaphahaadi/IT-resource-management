import { useState, useEffect } from "react"
import { NativeSelect } from "./native-select"
import { apiService } from "../../services/api"

const UserSelect = ({ 
  name, 
  value, 
  onChange, 
  required = false, 
  disabled = false,
  placeholder = "Select User",
  userType = "personnel", // "personnel", "users", "assignable"
  className = "",
  ...props 
}) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [userType])

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    
    try {
      let response
      
      switch (userType) {
        case "personnel":
          response = await apiService.getPersonnel({ page_size: 100 })
          break
        case "assignable":
          response = await apiService.getUsersForAssignment({ page_size: 100 })
          break
        case "active":
          response = await apiService.getActiveUsers({ page_size: 100 })
          break
        case "available":
          response = await apiService.getAvailablePersonnel()
          break
        default:
          response = await apiService.getPersonnel({ page_size: 100 })
      }
      
      const data = response.data.results || response.data
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(`Error fetching ${userType}:`, err)
      setError(`Failed to load ${userType}`)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const getUserDisplayName = (user) => {
    // Try different possible name fields
    const name = user.user_name || user.username || user.name || user.full_name || 
                 `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                 `User ${user.id}`
    
    const additional = user.skill_level || user.role || user.department || ''
    
    return additional ? `${name} - ${additional}` : name
  }

  if (error) {
    return (
      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
        {error}
        <button 
          onClick={fetchUsers}
          className="ml-2 text-red-700 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <NativeSelect
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      <option value="">
        {loading ? `Loading ${userType}...` : placeholder}
      </option>
      {users.map((user) => (
        <option key={user.id} value={String(user.id)}>
          {getUserDisplayName(user)}
        </option>
      ))}
      {!loading && users.length === 0 && (
        <option value="" disabled>
          No {userType} available
        </option>
      )}
    </NativeSelect>
  )
}

export default UserSelect
