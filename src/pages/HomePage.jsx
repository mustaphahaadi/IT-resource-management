import { Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/AuthContext";
import { 
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  UsersIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ServerIcon,
  BoltIcon,
  ClockIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"

const HomePage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const features = [
    {
      name: 'IT Support Tickets',
      description: 'Submit and track IT support requests with intelligent routing and SLA management.',
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-600'
    },
    {
      name: 'Asset Management',
      description: 'Complete IT asset lifecycle management with maintenance tracking and reporting.',
      icon: ComputerDesktopIcon,
      bgColor: 'bg-green-600',
      textColor: 'text-green-600'
    },
    {
      name: 'Task Automation',
      description: 'Intelligent task assignment with workload balancing and skill-based routing.',
      icon: BoltIcon,
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-600'
    },
    {
      name: 'Team Management',
      description: 'Role-based access control with approval workflows and team collaboration.',
      icon: UsersIcon,
      bgColor: 'bg-orange-600',
      textColor: 'text-orange-600'
    },
    {
      name: 'Real-time Analytics',
      description: 'Comprehensive dashboards with performance metrics and trend analysis.',
      icon: ChartBarIcon,
      bgColor: 'bg-indigo-600',
      textColor: 'text-indigo-600'
    },
    {
      name: 'Enterprise Security',
      description: 'Advanced security features with audit trails and compliance monitoring.',
      icon: ShieldCheckIcon,
      bgColor: 'bg-red-600',
      textColor: 'text-red-600'
    }
  ]


  const stats = [
    { number: '10,000+', label: 'IT Assets Managed', icon: ComputerDesktopIcon, bgColor: 'bg-blue-600' },
    { number: '500+', label: 'Healthcare Facilities', icon: GlobeAltIcon, bgColor: 'bg-green-600' },
    { number: '99.9%', label: 'System Uptime', icon: ServerIcon, bgColor: 'bg-purple-600' },
    { number: '24/7', label: 'Expert Support', icon: ClockIcon, bgColor: 'bg-orange-600' }
  ]

  const benefits = [
    "Streamlined IT resource allocation",
    "Enhanced security and compliance", 
    "Reduced operational costs",
    "Improved staff productivity",
    "Comprehensive audit trails",
    "Real-time system monitoring"
  ]


  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-blue-900">Ghana Health IT Portal</span>
            </Link>

            <div className="flex items-center gap-3">
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
      <div className="relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-blue-700 opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <WrenchScrewdriverIcon className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Professional IT
              <span className="block text-blue-100">
                Support Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Enterprise-grade IT service management platform designed for healthcare organizations. 
              Streamline support requests, manage assets, and optimize team performance with intelligent automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/app/dashboard">
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
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardHeader className="text-center pb-6">
                <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} text-white flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">{feature.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
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

      {/* Contact Section */}
      <div className="bg-blue-600 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your IT Operations?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Join thousands of healthcare organizations worldwide who trust our platform for their IT service management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-blue-700 rounded-2xl p-8">
              <PhoneIcon className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Call Us</h3>
              <p className="text-blue-100">+1 (555) 123-4567</p>
            </div>
            <div className="bg-blue-700 rounded-2xl p-8">
              <EnvelopeIcon className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
              <p className="text-blue-100">support@itsupport.com</p>
            </div>
            <div className="bg-blue-700 rounded-2xl p-8">
              <MapPinIcon className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Visit Us</h3>
              <p className="text-blue-100">123 Healthcare Ave, Suite 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">IT Support Pro</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Enterprise-grade IT service management platform designed for healthcare organizations worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/status" className="hover:text-white transition-colors">System Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 IT Support Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

