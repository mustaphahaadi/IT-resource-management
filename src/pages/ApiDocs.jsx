import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  CodeBracketIcon,
  DocumentTextIcon,
  KeyIcon,
  ServerIcon,
  ClipboardDocumentIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const ApiDocs = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [expandedSections, setExpandedSections] = useState(['authentication'])

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const apiSections = [
    {
      id: 'authentication',
      title: 'Authentication',
      description: 'User authentication and authorization endpoints',
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/login/',
          description: 'Authenticate user and get access token',
          requestBody: {
            username: 'string',
            password: 'string',
            rememberMe: 'boolean (optional)'
          },
          response: {
            token: 'string',
            user: {
              id: 'integer',
              username: 'string',
              email: 'string',
              role: 'string',
              permissions: 'array'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/auth/register/',
          description: 'Register new user account',
          requestBody: {
            username: 'string',
            email: 'string',
            password: 'string',
            first_name: 'string',
            last_name: 'string',
            department: 'string'
          }
        },
        {
          method: 'POST',
          path: '/api/auth/logout/',
          description: 'Logout user and invalidate token',
          headers: {
            Authorization: 'Token {token}'
          }
        },
        {
          method: 'GET',
          path: '/api/auth/user/',
          description: 'Get current user information',
          headers: {
            Authorization: 'Token {token}'
          }
        }
      ]
    },
    {
      id: 'equipment',
      title: 'Equipment Management',
      description: 'Manage hospital IT equipment and inventory',
      endpoints: [
        {
          method: 'GET',
          path: '/api/inventory/equipment/',
          description: 'List all equipment with optional filtering',
          queryParams: {
            status: 'string (active, maintenance, retired, broken)',
            category: 'string',
            location: 'string',
            search: 'string',
            page: 'integer',
            limit: 'integer'
          }
        },
        {
          method: 'POST',
          path: '/api/inventory/equipment/',
          description: 'Create new equipment record',
          requestBody: {
            name: 'string',
            category: 'string',
            serial_number: 'string',
            location: 'string',
            status: 'string',
            assigned_to: 'integer (optional)',
            purchase_date: 'date (optional)',
            warranty_expiry: 'date (optional)'
          }
        },
        {
          method: 'GET',
          path: '/api/inventory/equipment/{id}/',
          description: 'Get specific equipment details'
        },
        {
          method: 'PATCH',
          path: '/api/inventory/equipment/{id}/',
          description: 'Update equipment information'
        },
        {
          method: 'DELETE',
          path: '/api/inventory/equipment/{id}/',
          description: 'Delete equipment record'
        }
      ]
    },
    {
      id: 'requests',
      title: 'Support Requests',
      description: 'Manage IT support requests and tickets',
      endpoints: [
        {
          method: 'GET',
          path: '/api/requests/support-requests/',
          description: 'List support requests with filtering',
          queryParams: {
            status: 'string (open, assigned, in_progress, resolved, closed)',
            priority: 'string (critical, high, medium, low)',
            category: 'string',
            assigned_to: 'integer',
            search: 'string'
          }
        },
        {
          method: 'POST',
          path: '/api/requests/support-requests/',
          description: 'Create new support request',
          requestBody: {
            title: 'string',
            description: 'string',
            category: 'string',
            priority: 'string',
            requester_email: 'string (optional)',
            requester_phone: 'string (optional)',
            department: 'string (optional)'
          }
        },
        {
          method: 'POST',
          path: '/api/requests/support-requests/{id}/assign/',
          description: 'Assign request to personnel',
          requestBody: {
            assigned_to: 'integer'
          }
        }
      ]
    },
    {
      id: 'tasks',
      title: 'Task Management',
      description: 'Manage tasks and workflows',
      endpoints: [
        {
          method: 'GET',
          path: '/api/tasks/tasks/',
          description: 'List tasks with filtering'
        },
        {
          method: 'POST',
          path: '/api/tasks/tasks/',
          description: 'Create new task'
        },
        {
          method: 'POST',
          path: '/api/tasks/tasks/{id}/start/',
          description: 'Start task execution'
        },
        {
          method: 'POST',
          path: '/api/tasks/tasks/{id}/complete/',
          description: 'Mark task as completed'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'Get system analytics and generate reports',
      endpoints: [
        {
          method: 'GET',
          path: '/api/analytics/dashboard/',
          description: 'Get dashboard analytics data'
        },
        {
          method: 'GET',
          path: '/api/analytics/equipment/',
          description: 'Get equipment analytics'
        },
        {
          method: 'POST',
          path: '/api/reports/generate/',
          description: 'Generate custom report',
          requestBody: {
            report_type: 'string',
            start_date: 'date',
            end_date: 'date',
            format: 'string (pdf, csv, xlsx)'
          }
        }
      ]
    }
  ]

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800'
      case 'POST':
        return 'bg-blue-100 text-blue-800'
      case 'PATCH':
        return 'bg-yellow-100 text-yellow-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-600 mt-1">Complete API reference for Hospital IT System</p>
        </div>
      </div>

      {/* API Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ServerIcon className="w-6 h-6 text-blue-600" />
            <span>API Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Base URL</h3>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                https://api.hospital-it.com/api/
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Authentication</h3>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                Authorization: Token {'{'}your-token{'}'}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Response Format</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">{`{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <KeyIcon className="w-6 h-6 text-green-600" />
            <span>Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">Token-based Authentication</h4>
                <p className="text-sm text-blue-800 mt-1">
                  All API requests require a valid authentication token in the Authorization header.
                  Tokens are obtained through the login endpoint and remain valid for 24 hours.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Getting a Token</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">{`curl -X POST https://api.hospital-it.com/api/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'`}</pre>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Using the Token</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">{`curl -X GET https://api.hospital-it.com/api/inventory/equipment/ \\
  -H "Authorization: Token your-token-here"`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {apiSections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{section.title}</span>
                      </div>
                      {expandedSections.includes(section.id) ? (
                        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSections.includes(section.id) && (
                      <div className="pl-8 pb-2 space-y-1">
                        {section.endpoints.map((endpoint, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedEndpoint({ ...endpoint, sectionTitle: section.title })}
                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                          >
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded mr-2 ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            {endpoint.path.split('/').pop()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedEndpoint ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-lg">{selectedEndpoint.path}</span>
                  </CardTitle>
                  <Button
                    onClick={() => copyToClipboard(selectedEndpoint.path)}
                    variant="outline"
                    size="sm"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-600">{selectedEndpoint.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Headers */}
                {selectedEndpoint.headers && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Headers</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <pre className="text-sm font-mono">
                        {Object.entries(selectedEndpoint.headers).map(([key, value]) => (
                          <div key={key}>{key}: {value}</div>
                        ))}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Query Parameters */}
                {selectedEndpoint.queryParams && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Query Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-900">Parameter</th>
                            <th className="text-left py-2 font-medium text-gray-900">Type</th>
                            <th className="text-left py-2 font-medium text-gray-900">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(selectedEndpoint.queryParams).map(([param, type]) => (
                            <tr key={param} className="border-b border-gray-100">
                              <td className="py-2 font-mono text-blue-600">{param}</td>
                              <td className="py-2 text-gray-600">{type}</td>
                              <td className="py-2 text-gray-600">-</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {selectedEndpoint.requestBody && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Request Body</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Response */}
                {selectedEndpoint.response && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Response</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        {JSON.stringify(selectedEndpoint.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Example */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Example Request</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`curl -X ${selectedEndpoint.method} https://api.hospital-it.com${selectedEndpoint.path} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Token your-token-here"${selectedEndpoint.requestBody ? ' \\\n  -d \'' + JSON.stringify(selectedEndpoint.requestBody, null, 2) + '\'' : ''}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CodeBracketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Endpoint</h3>
                <p className="text-gray-600">Choose an endpoint from the sidebar to view its documentation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <span>Error Codes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium text-gray-900">Code</th>
                  <th className="text-left py-3 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 font-medium text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: 200, status: 'OK', description: 'Request successful' },
                  { code: 201, status: 'Created', description: 'Resource created successfully' },
                  { code: 400, status: 'Bad Request', description: 'Invalid request parameters' },
                  { code: 401, status: 'Unauthorized', description: 'Authentication required' },
                  { code: 403, status: 'Forbidden', description: 'Insufficient permissions' },
                  { code: 404, status: 'Not Found', description: 'Resource not found' },
                  { code: 429, status: 'Too Many Requests', description: 'Rate limit exceeded' },
                  { code: 500, status: 'Internal Server Error', description: 'Server error occurred' }
                ].map((error) => (
                  <tr key={error.code} className="border-b border-gray-100">
                    <td className="py-3 font-mono font-medium">{error.code}</td>
                    <td className="py-3 font-medium">{error.status}</td>
                    <td className="py-3 text-gray-600">{error.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiDocs
