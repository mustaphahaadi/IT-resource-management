import { Badge } from './badge'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const StatusBadge = ({ 
  status, 
  type = 'default', // 'default', 'request', 'task', 'equipment', 'user'
  size = 'sm', // 'xs', 'sm', 'md', 'lg'
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    const configs = {
      // Request statuses
      open: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: InformationCircleIcon,
        label: 'Open'
      },
      assigned: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: ArrowPathIcon,
        label: 'Assigned'
      },
      in_progress: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: ClockIcon,
        label: 'In Progress'
      },
      pending_user: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: ClockIcon,
        label: 'Pending User'
      },
      pending_approval: { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: ClockIcon,
        label: 'Pending Approval'
      },
      escalated: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: ExclamationTriangleIcon,
        label: 'Escalated'
      },
      resolved: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircleIcon,
        label: 'Resolved'
      },
      closed: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: CheckCircleIcon,
        label: 'Closed'
      },
      cancelled: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: XCircleIcon,
        label: 'Cancelled'
      },

      // Task statuses
      pending: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: ClockIcon,
        label: 'Pending'
      },
      active: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircleIcon,
        label: 'Active'
      },
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircleIcon,
        label: 'Completed'
      },
      overdue: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: ExclamationTriangleIcon,
        label: 'Overdue'
      },

      // Equipment statuses
      operational: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircleIcon,
        label: 'Operational'
      },
      maintenance: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: ClockIcon,
        label: 'Maintenance'
      },
      repair: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: ExclamationTriangleIcon,
        label: 'Under Repair'
      },
      retired: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: XCircleIcon,
        label: 'Retired'
      },
      critical: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: ExclamationTriangleIcon,
        label: 'Critical'
      },

      // Priority levels
      low: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: InformationCircleIcon,
        label: 'Low Priority'
      },
      medium: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: InformationCircleIcon,
        label: 'Medium Priority'
      },
      high: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: ExclamationTriangleIcon,
        label: 'High Priority'
      },
      urgent: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: ExclamationTriangleIcon,
        label: 'Urgent'
      },

      // User statuses
      approved: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircleIcon,
        label: 'Approved'
      },
      pending_approval: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: ClockIcon,
        label: 'Pending Approval'
      },
      inactive: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: XCircleIcon,
        label: 'Inactive'
      },

      // Default fallback
      default: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: InformationCircleIcon,
        label: status || 'Unknown'
      }
    }

    return configs[status?.toLowerCase()] || configs.default
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-xs'
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'md':
        return 'px-2.5 py-1.5 text-sm'
      case 'lg':
        return 'px-3 py-2 text-base'
      default:
        return 'px-2 py-1 text-xs'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return 'w-3 h-3'
      case 'md':
        return 'w-4 h-4'
      case 'lg':
        return 'w-5 h-5'
      default:
        return 'w-3 h-3'
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge 
      className={`
        inline-flex items-center gap-1 font-medium border
        ${config.color}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {showIcon && Icon && <Icon className={getIconSize()} />}
      {config.label}
    </Badge>
  )
}

export default StatusBadge
