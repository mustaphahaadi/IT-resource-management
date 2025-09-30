import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon
} from "@heroicons/react/24/outline"

const Features = () => {
  const coreFeatures = [
    {
      icon: ExclamationTriangleIcon,
      title: 'IT Support Requests',
      description: 'Comprehensive ticketing system with intelligent routing and SLA management.',
      features: [
        'AI-powered auto-categorization',
        'Priority-based SLA tracking',
        'Real-time status updates',
        'Mobile-optimized interface',
        'File attachment support',
        'Integrated knowledge base',
        'Escalation workflows',
        'Comment threads & collaboration'
      ],
      color: 'text-blue-600'
    },
    {
      icon: ComputerDesktopIcon,
      title: 'Asset Management',
      description: 'Complete lifecycle management for all IT equipment and resources.',
      features: [
        'Equipment inventory tracking',
        'Maintenance scheduling',
        'Warranty management',
        'Cost tracking & depreciation',
        'Location management',
        'Compliance reporting'
      ],
      color: 'text-green-600'
    },
    {
      icon: ClipboardDocumentListIcon,
      title: 'Task Management',
      description: 'Intelligent task assignment and workflow automation.',
      features: [
        'Intelligent skill-based assignment',
        'Real-time workload balancing',
        'Automated escalation workflows',
        'Progress tracking & reporting',
        'Time logging & analytics',
        'Performance metrics & KPIs',
        'Mobile task management',
        'Team collaboration tools'
      ],
      color: 'text-purple-600'
    },
    {
      icon: UsersIcon,
      title: 'User Management',
      description: 'Role-based access control with approval workflows.',
      features: [
        'Role-based permissions',
        'User approval workflows',
        'Department management',
        'Single sign-on (SSO)',
        'Activity logging',
        'Security compliance'
      ],
      color: 'text-orange-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reporting',
      description: 'Comprehensive insights and performance analytics.',
      features: [
        'Real-time dashboards',
        'SLA compliance reports',
        'Performance metrics',
        'Cost analysis',
        'Trend analysis',
        'Custom reports'
      ],
      color: 'text-indigo-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with healthcare compliance.',
      features: [
        'HIPAA compliance',
        'SOC 2 certification',
        'Data encryption',
        'Audit trails',
        'Access controls',
        'Security monitoring'
      ],
      color: 'text-red-600'
    }
  ]

  const advancedFeatures = [
    {
      icon: BellIcon,
      title: 'Smart Notifications',
      description: 'Multi-channel notifications with intelligent routing based on priority and role.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Optimization',
      description: 'Full mobile experience for technicians and users on the go.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-time Collaboration',
      description: 'Built-in chat and collaboration tools for team communication.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Knowledge Base',
      description: 'Searchable knowledge base with solution templates and procedures.'
    },
    {
      icon: CogIcon,
      title: 'Workflow Automation',
      description: 'Automated workflows for common processes and escalations.'
    },
    {
      icon: ClockIcon,
      title: 'SLA Management',
      description: 'Automated SLA tracking with violation alerts and escalation.'
    }
  ]

  const integrations = [
    { name: 'Active Directory', type: 'Authentication' },
    { name: 'ServiceNow', type: 'ITSM' },
    { name: 'Slack', type: 'Communication' },
    { name: 'Microsoft Teams', type: 'Communication' },
    { name: 'Jira', type: 'Project Management' },
    { name: 'Salesforce', type: 'CRM' },
    { name: 'Office 365', type: 'Productivity' },
    { name: 'Google Workspace', type: 'Productivity' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-blue-900">Ghana Health IT Portal</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors">About</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors">Pricing</Link>
              <Link to="/contact" className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Enterprise IT Helpdesk Features
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Comprehensive IT support and management capabilities designed specifically for healthcare environments, 
            with intelligent automation, enterprise-grade security, and HIPAA compliance built in.
          </p>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Core Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage IT operations efficiently in a healthcare environment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#2F327D]">{feature.title}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Advanced Capabilities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhanced features that set our platform apart from traditional IT management solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="text-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-[#2F327D] mx-auto mb-4" />
                  <CardTitle className="text-lg text-[#2F327D]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Seamless Integrations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with your existing tools and systems for a unified IT management experience.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="text-center border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-[#2F327D] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CogIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#2F327D] text-sm mb-1">{integration.name}</h3>
                  <p className="text-xs text-gray-500">{integration.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-[#2F327D] to-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">Why Healthcare Organizations Choose Us</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Reduce Response Times by 60%</h3>
                    <p className="text-white/90 text-sm">Intelligent routing and automation dramatically improve response times.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Ensure HIPAA Compliance</h3>
                    <p className="text-white/90 text-sm">Built-in compliance features and audit trails for healthcare regulations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Save Thousands in Equipment Costs</h3>
                    <p className="text-white/90 text-sm">Proactive maintenance and lifecycle management reduce unexpected costs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Improve Staff Productivity</h3>
                    <p className="text-white/90 text-sm">Streamlined workflows and self-service options free up IT staff time.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#2F327D] mb-6">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of healthcare professionals who trust our platform for their IT management needs.
                </p>
                <div className="space-y-4">
                  <Link to="/register">
                    <Button size="lg" className="w-full">
                      Start Free Trial
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/analytics">
                    <Button size="lg" variant="outline" className="w-full">
                      View Live Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#2F327D] mb-4">
            Have Questions About Our Features?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our healthcare IT experts are here to help you understand how our platform can transform your operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg">
                <PhoneIcon className="w-5 h-5 mr-2" />
                Schedule a Demo
              </Button>
            </Link>
            <Link to="/help">
              <Button size="lg" variant="outline">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features
