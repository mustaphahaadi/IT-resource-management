import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/AuthContext"
import { 
  HeartIcon,
  ShieldCheckIcon,
  UsersIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { useState } from "react"

const HomePage = () => {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
  ]

  const features = [
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Hospital IT</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
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
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1"
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <HeartIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Hospital IT
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}Management System
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Comprehensive IT resource management solution designed specifically for healthcare environments. 
              Streamline operations, enhance security, and improve patient care through intelligent technology management.
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Healthcare IT
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides everything you need to manage IT resources efficiently in a hospital environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
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

      {/* Benefits Section */}
      <div id="about" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for healthcare environments, our system addresses the unique challenges 
                of managing IT resources in hospitals and medical facilities.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CogIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Enterprise-Grade Solution
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Trusted by healthcare professionals worldwide for reliable, secure, and scalable IT management.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">99.9%</div>
                      <div className="text-xs text-gray-500">Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">24/7</div>
                      <div className="text-xs text-gray-500">Support</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">SOC2</div>
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HeartIcon className="w-6 h-6 text-blue-400" />
                <span className="font-semibold text-lg">Hospital IT System</span>
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
