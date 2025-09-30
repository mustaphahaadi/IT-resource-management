import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/AuthContext"
import { 
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  UsersIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline"
import { useState } from "react"

const HomePage = () => {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ]

  const features = [
    {
      name: 'IT Support Requests',
      description: 'Submit and track IT support tickets for hardware, software, and network issues.',
      icon: ExclamationTriangleIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Equipment Management',
      description: 'Manage IT assets, track maintenance schedules, and monitor equipment status.',
      icon: ComputerDesktopIcon,
      color: 'text-green-600'
    },
    {
      name: 'Task Assignment',
      description: 'Intelligent task routing and workload management for IT technicians.',
      icon: ClipboardDocumentListIcon,
      color: 'text-purple-600'
    },
    {
      name: 'User Management',
      description: 'Role-based access control with approval workflows for system security.',
      icon: UsersIcon,
      color: 'text-orange-600'
    },
    {
      name: 'Analytics & Reporting',
      description: 'Comprehensive reporting on SLA compliance, performance metrics, and trends.',
      icon: ChartBarIcon,
      color: 'text-indigo-600'
    },
    {
      name: 'System Administration',
      description: 'Complete system configuration, monitoring, and security management.',
      icon: ShieldCheckIcon,
      color: 'text-red-600'
    }
  ]

  const oldFeatures = [
    {
      icon: ComputerDesktopIcon,
      title: "IT Asset Management",
      description: "Track and manage all hospital IT equipment, from computers to medical devices.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: UsersIcon,
      title: "User Management",
      description: "Comprehensive user registration, role assignment, and access control.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: ShieldCheckIcon,
      title: "Security & Compliance",
      description: "Advanced security features with audit trails and compliance reporting.",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: ChartBarIcon,
      title: "Analytics & Reporting",
      description: "Real-time dashboards and comprehensive reporting for informed decisions.",
      color: "bg-orange-50 text-orange-600"
    }
  ]

  const benefits = [
    "Streamlined IT resource allocation",
    "Enhanced security and compliance",
    "Reduced operational costs",
    "Improved staff productivity",
    "Real-time monitoring and alerts",
    "Comprehensive audit trails"
  ]

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      hospital: 'Metropolitan General Hospital',
      content: 'This system has revolutionized our IT support. Response times are down 60% and our technicians can focus on critical patient care.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'IT Director',
      hospital: 'Regional Medical Center',
      content: 'The asset management features alone have saved us thousands in equipment costs. The reporting is exceptional for compliance.',
      avatar: 'MC'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'System Administrator',
      hospital: 'University Hospital',
      content: 'User approval workflows and role-based access give us the security we need in healthcare. Couldn\'t operate without it.',
      avatar: 'LR'
    }
  ]

  const stats = [
    { number: '5,000+', label: 'IT Assets Managed' },
    { number: '25+', label: 'Ghana Health Facilities' },
    { number: '99.5%', label: 'System Uptime' },
    { number: '24/7', label: 'Support Available' }
  ]

  const workflowSteps = [
    {
      step: '1',
      title: 'Submit Request',
      description: 'Users submit IT support requests through an intuitive interface with automatic categorization.'
    },
    {
      step: '2',
      title: 'Smart Routing',
      description: 'AI-powered routing assigns tickets to the right technician based on skills and workload.'
    },
    {
      step: '3',
      title: 'Resolution & Tracking',
      description: 'Real-time updates, SLA monitoring, and comprehensive audit trails for every request.'
    },
    {
      step: '4',
      title: 'Analytics & Improvement',
      description: 'Detailed reporting helps optimize processes and improve service delivery.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-blue-900">Ghana Health IT Portal</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Welcome, {user.first_name || user.username}</span>
                  <Link to="/dashboard">
                    <Button size="sm">Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors duration-200 px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <span className="text-sm text-gray-600 px-2">Welcome, {user.first_name || user.username}</span>
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Dashboard</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">Sign In</Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ghana Healthcare IT
              <span className="text-blue-200">
                {" "}Management System
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Revolutionize Ghana's healthcare IT infrastructure with intelligent automation, comprehensive asset management, 
              and role-based workflows. Built specifically for Ghana's healthcare system with enterprise-grade security and local compliance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2F327D] mb-4">
            Powerful Features for Healthcare IT
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides everything you need to manage IT resources efficiently in a hospital environment.
          </p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-[#2F327D]">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-lg bg-[#2F327D] text-white flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg text-[#2F327D]">{feature.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">
              How Our IT Helpdesk Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamlined workflows designed for healthcare IT environments with intelligent automation and role-based access.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-[#2F327D] text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    {step.step}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-300 -translate-y-0.5"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[#2F327D] mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">
              Trusted by Healthcare Organizations Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of healthcare professionals who rely on our platform for their IT management needs.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#2F327D] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what healthcare IT professionals are saying about our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#2F327D] text-white rounded-full flex items-center justify-center font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold text-[#2F327D]">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.hospital}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="about" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#2F327D] mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for healthcare environments, our system addresses the unique challenges 
                of managing IT resources in hospitals and medical facilities.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#2F327D]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-3 h-3 text-[#2F327D]" />
                    </div>
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#2F327D] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CogIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2F327D] mb-4">
                    Enterprise-Grade Solution
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Trusted by healthcare professionals worldwide for reliable, secure, and scalable IT management.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#2F327D]">99.9%</div>
                      <div className="text-xs text-gray-500">Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#2F327D]">24/7</div>
                      <div className="text-xs text-gray-500">Support</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#2F327D]">SOC2</div>
                      <div className="text-xs text-gray-500">Compliant</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2F327D] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
                <span className="font-semibold text-lg">IT Support Portal</span>
              </div>
              <p className="text-gray-400 text-sm">
                Comprehensive IT management solution for healthcare environments.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/inventory" className="hover:text-white transition-colors">Inventory</Link></li>
                <li><Link to="/reports" className="hover:text-white transition-colors">Reports</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {user ? (
                  <>
                    <li><Link to="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                    <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                    <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Hospital IT Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

