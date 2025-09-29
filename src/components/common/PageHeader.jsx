import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { usePermissions, getRoleDisplayName } from '../../contexts/PermissionsContext'
import {
  ArrowPathIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const PageHeader = ({
  title,
  description,
  icon: Icon,
  actions = [],
  stats = [],
  showRefresh = false,
  onRefresh,
  className = '',
  breadcrumbs = [],
  alerts = []
}) => {
  const { user, userRole } = usePermissions()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border flex items-start gap-3 ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : alert.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {alert.type === 'error' ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {alert.title && (
                  <div className="font-medium mb-1">{alert.title}</div>
                )}
                <div className="text-sm">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>

          {/* User Context */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Welcome, {user?.first_name || user?.username}</span>
            <Badge variant="outline" className="text-xs">
              {getRoleDisplayName(userRole)}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </Button>
          )}
          
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size={action.size || 'sm'}
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.className}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 text-center"
            >
              <div className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageHeader
