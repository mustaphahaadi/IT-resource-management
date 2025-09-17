import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpenIcon className="w-5 h-5" />,
      content: {
        title: 'Getting Started with Hospital IT System',
        items: [
          {
            title: 'System Overview',
            content: 'The Hospital IT Resource Management System helps you manage IT infrastructure, track equipment, handle support requests, and monitor system performance in real-time.'
          },
          {
            title: 'First Login',
            content: 'After logging in, you\'ll be directed to the dashboard where you can see an overview of all system activities. Use the sidebar navigation to access different modules.'
          },
          {
            title: 'Navigation',
            content: 'The main navigation is located in the left sidebar. Click on any module to access its features. The header contains search functionality and notifications.'
          },
          {
            title: 'User Roles',
            content: 'Different user roles have different permissions. Administrators can access all features, while regular users have limited access based on their department and responsibilities.'
          }
        ]
      }
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <ChartBarIcon className="w-5 h-5" />,
      content: {
        title: 'Understanding the Dashboard',
        items: [
          {
            title: 'System Metrics',
            content: 'The dashboard displays key performance indicators including system uptime, response times, and resolution rates. These metrics are updated in real-time.'
          },
          {
            title: 'Equipment Overview',
            content: 'View the status of all equipment including active, maintenance, and critical items. Click on any metric to drill down into detailed views.'
          },
          {
            title: 'Recent Activity',
            content: 'The activity feed shows recent system events, completed tasks, and resolved requests. This helps you stay updated on system changes.'
          },
          {
            title: 'Quick Actions',
            content: 'Use the quick action buttons to create new requests, add equipment, or assign tasks without navigating to different pages.'
          }
        ]
      }
    },
    {
      id: 'inventory',
      title: 'Equipment Management',
      icon: <ComputerDesktopIcon className="w-5 h-5" />,
      content: {
        title: 'Managing Equipment Inventory',
        items: [
          {
            title: 'Adding Equipment',
            content: 'Click the "Add Equipment" button to register new devices. Fill in all required fields including serial number, location, and assigned personnel.'
          },
          {
            title: 'Equipment Status',
            content: 'Equipment can have different statuses: Active (operational), Maintenance (scheduled maintenance), Retired (no longer in use), or Broken (needs repair).'
          },
          {
            title: 'Maintenance Scheduling',
            content: 'Schedule regular maintenance for equipment to prevent issues. The system will send notifications when maintenance is due.'
          },
          {
            title: 'Search and Filters',
            content: 'Use the search bar and filters to quickly find specific equipment. You can filter by status, category, location, or assigned personnel.'
          }
        ]
      }
    },
    {
      id: 'requests',
      title: 'Support Requests',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      content: {
        title: 'Managing Support Requests',
        items: [
          {
            title: 'Creating Requests',
            content: 'Submit new support requests by clicking "New Request". Provide detailed descriptions and select appropriate priority levels.'
          },
          {
            title: 'Request Priorities',
            content: 'Critical: Immediate attention required, affects patient care. High: Important but not critical. Medium: Standard requests. Low: Minor issues or enhancements.'
          },
          {
            title: 'Assignment Workflow',
            content: 'Requests are automatically assigned based on category and availability. Administrators can manually reassign requests as needed.'
          },
          {
            title: 'Status Tracking',
            content: 'Track request progress through different statuses: Open, Assigned, In Progress, Pending, Resolved, and Closed.'
          }
        ]
      }
    },
    {
      id: 'tasks',
      title: 'Task Management',
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      content: {
        title: 'Managing Tasks and Workflows',
        items: [
          {
            title: 'Creating Tasks',
            content: 'Create tasks for routine maintenance, projects, or follow-up activities. Set due dates and estimated completion times.'
          },
          {
            title: 'Task Assignment',
            content: 'Assign tasks to specific personnel based on their skills and availability. The system tracks workload to prevent overallocation.'
          },
          {
            title: 'Progress Tracking',
            content: 'Monitor task progress and update status as work progresses. Add notes and time tracking for accurate reporting.'
          },
          {
            title: 'Personnel Management',
            content: 'View personnel workload and availability. Balance task assignments to optimize team productivity.'
          }
        ]
      }
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: <ChartBarIcon className="w-5 h-5" />,
      content: {
        title: 'Generating Reports and Analytics',
        items: [
          {
            title: 'Report Types',
            content: 'Generate various reports including equipment status, request analytics, task completion rates, and performance metrics.'
          },
          {
            title: 'Custom Date Ranges',
            content: 'Select specific date ranges for reports to analyze trends and performance over time. Use preset ranges or custom dates.'
          },
          {
            title: 'Export Options',
            content: 'Export reports in multiple formats including PDF for sharing, CSV for data analysis, and direct printing options.'
          },
          {
            title: 'Scheduled Reports',
            content: 'Set up automated report generation and delivery via email for regular monitoring and compliance requirements.'
          }
        ]
      }
    }
  ]

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link via email.'
    },
    {
      question: 'Why can\'t I access certain features?',
      answer: 'Access to features depends on your user role and permissions. Contact your administrator if you need additional access.'
    },
    {
      question: 'How do I report a critical system issue?',
      answer: 'Create a new support request and set the priority to "Critical". This will immediately notify the IT team and escalate the issue.'
    },
    {
      question: 'Can I export data from the system?',
      answer: 'Yes, most data can be exported through the Reports section. You can export in PDF, CSV, or Excel formats depending on your needs.'
    },
    {
      question: 'How often is the system updated?',
      answer: 'The system receives regular updates for security patches and new features. Major updates are typically deployed during maintenance windows.'
    },
    {
      question: 'What browsers are supported?',
      answer: 'The system works best with modern browsers including Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.'
    },
    {
      question: 'How do I change my notification preferences?',
      answer: 'Go to Settings > Notifications to customize which notifications you receive and how you want to be notified.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, the system uses industry-standard encryption and security measures to protect your data. All access is logged and monitored.'
    }
  ]

  const contactOptions = [
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Call our support team for immediate assistance',
      contact: '+1 (555) 123-4567',
      availability: 'Mon-Fri, 8AM-6PM EST'
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Send us an email for non-urgent issues',
      contact: 'support@hospital-it.com',
      availability: 'Response within 24 hours'
    },
    {
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available in-app',
      availability: 'Mon-Fri, 9AM-5PM EST'
    }
  ]

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.items.some(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
          <p className="text-gray-600 mt-1">Find answers and learn how to use the system effectively</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      activeSection === section.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Documentation Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
                <span>{sections.find(s => s.id === activeSection)?.content.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sections.find(s => s.id === activeSection)?.content.items.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QuestionMarkCircleIcon className="w-6 h-6 text-green-600" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4 text-gray-700">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                <span>Need More Help?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactOptions.map((option, index) => (
                  <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        {option.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                    <p className="font-medium text-blue-600 mb-1">{option.contact}</p>
                    <p className="text-xs text-gray-500">{option.availability}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LightBulbIcon className="w-6 h-6 text-yellow-600" />
                <span>Quick Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Keyboard Shortcuts</h4>
                    <p className="text-sm text-blue-700">Press Ctrl+K to quickly search across the system</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900">Real-time Updates</h4>
                    <p className="text-sm text-green-700">The system updates automatically - no need to refresh</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Mobile Access</h4>
                    <p className="text-sm text-yellow-700">The system works on mobile devices and tablets</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-purple-900">Data Export</h4>
                    <p className="text-sm text-purple-700">Export any data for external analysis or reporting</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Help
