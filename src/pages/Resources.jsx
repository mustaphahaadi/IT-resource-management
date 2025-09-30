import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline"

const Resources = () => {
  const resourceCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <BookOpenIcon className="w-8 h-8" />,
      description: "Essential guides to help you get up and running quickly",
      color: "bg-blue-100 text-blue-600",
      resources: [
        {
          title: "Quick Start Guide",
          type: "PDF",
          description: "Complete setup guide for new organizations",
          duration: "15 min read",
          downloadUrl: "#"
        },
        {
          title: "Platform Overview Video",
          type: "Video",
          description: "Visual walkthrough of key features and capabilities",
          duration: "12 minutes",
          downloadUrl: "#"
        },
        {
          title: "User Registration & Setup",
          type: "Guide",
          description: "Step-by-step user onboarding process",
          duration: "8 min read",
          downloadUrl: "#"
        },
        {
          title: "First 30 Days Checklist",
          type: "Checklist",
          description: "Essential tasks for successful implementation",
          duration: "5 min read",
          downloadUrl: "#"
        }
      ]
    },
    {
      id: "user-guides",
      title: "User Guides",
      icon: <UserIcon className="w-8 h-8" />,
      description: "Detailed guides for different user roles and responsibilities",
      color: "bg-green-100 text-green-600",
      resources: [
        {
          title: "End User Manual",
          type: "PDF",
          description: "Complete guide for submitting and tracking requests",
          duration: "25 min read",
          downloadUrl: "#"
        },
        {
          title: "Technician Handbook",
          type: "PDF",
          description: "Task management and resolution workflows",
          duration: "35 min read",
          downloadUrl: "#"
        },
        {
          title: "Manager's Guide",
          type: "PDF",
          description: "Team management and performance monitoring",
          duration: "30 min read",
          downloadUrl: "#"
        },
        {
          title: "Administrator Manual",
          type: "PDF",
          description: "System configuration and user management",
          duration: "45 min read",
          downloadUrl: "#"
        }
      ]
    },
    {
      id: "training-videos",
      title: "Training Videos",
      icon: <VideoCameraIcon className="w-8 h-8" />,
      description: "Video tutorials and training materials",
      color: "bg-purple-100 text-purple-600",
      resources: [
        {
          title: "Platform Navigation Basics",
          type: "Video",
          description: "Learn to navigate the interface efficiently",
          duration: "8 minutes",
          downloadUrl: "#"
        },
        {
          title: "Creating and Managing Requests",
          type: "Video",
          description: "Complete request lifecycle walkthrough",
          duration: "15 minutes",
          downloadUrl: "#"
        },
        {
          title: "Task Assignment and Tracking",
          type: "Video",
          description: "Efficient task management techniques",
          duration: "12 minutes",
          downloadUrl: "#"
        },
        {
          title: "Analytics and Reporting",
          type: "Video",
          description: "Generate insights from your data",
          duration: "18 minutes",
          downloadUrl: "#"
        }
      ]
    },
    {
      id: "technical-docs",
      title: "Technical Documentation",
      icon: <CogIcon className="w-8 h-8" />,
      description: "API documentation and integration guides",
      color: "bg-orange-100 text-orange-600",
      resources: [
        {
          title: "API Reference Guide",
          type: "Documentation",
          description: "Complete API endpoints and authentication",
          duration: "Reference",
          downloadUrl: "/api-docs"
        },
        {
          title: "Integration Cookbook",
          type: "PDF",
          description: "Common integration patterns and examples",
          duration: "40 min read",
          downloadUrl: "#"
        },
        {
          title: "Security Implementation Guide",
          type: "PDF",
          description: "HIPAA compliance and security best practices",
          duration: "30 min read",
          downloadUrl: "#"
        },
        {
          title: "Webhook Configuration",
          type: "Guide",
          description: "Set up real-time notifications and integrations",
          duration: "20 min read",
          downloadUrl: "#"
        }
      ]
    },
    {
      id: "best-practices",
      title: "Best Practices",
      icon: <AcademicCapIcon className="w-8 h-8" />,
      description: "Industry best practices and optimization guides",
      color: "bg-indigo-100 text-indigo-600",
      resources: [
        {
          title: "Healthcare IT Workflow Optimization",
          type: "Whitepaper",
          description: "Strategies for improving IT support efficiency",
          duration: "20 min read",
          downloadUrl: "#"
        },
        {
          title: "SLA Management Best Practices",
          type: "Guide",
          description: "Setting and maintaining service level agreements",
          duration: "15 min read",
          downloadUrl: "#"
        },
        {
          title: "Asset Lifecycle Management",
          type: "Guide",
          description: "Optimize equipment management and maintenance",
          duration: "25 min read",
          downloadUrl: "#"
        },
        {
          title: "Team Performance Metrics",
          type: "Template",
          description: "KPI templates and measurement strategies",
          duration: "10 min read",
          downloadUrl: "#"
        }
      ]
    },
    {
      id: "compliance",
      title: "Compliance & Security",
      icon: <ChartBarIcon className="w-8 h-8" />,
      description: "HIPAA compliance and security documentation",
      color: "bg-red-100 text-red-600",
      resources: [
        {
          title: "HIPAA Compliance Checklist",
          type: "Checklist",
          description: "Ensure your implementation meets HIPAA requirements",
          duration: "12 min read",
          downloadUrl: "#"
        },
        {
          title: "Security Audit Template",
          type: "Template",
          description: "Regular security assessment framework",
          duration: "Reference",
          downloadUrl: "#"
        },
        {
          title: "Business Associate Agreement",
          type: "Legal Document",
          description: "Standard BAA template for healthcare organizations",
          duration: "Legal Review",
          downloadUrl: "#"
        },
        {
          title: "Incident Response Playbook",
          type: "Playbook",
          description: "Step-by-step security incident response procedures",
          duration: "30 min read",
          downloadUrl: "#"
        }
      ]
    }
  ]

  const popularResources = [
    {
      title: "Quick Start Guide",
      type: "PDF",
      downloads: "2,847",
      rating: 4.9
    },
    {
      title: "Platform Overview Video",
      type: "Video",
      downloads: "1,923",
      rating: 4.8
    },
    {
      title: "API Reference Guide",
      type: "Documentation",
      downloads: "1,456",
      rating: 4.7
    },
    {
      title: "HIPAA Compliance Checklist",
      type: "Checklist",
      downloads: "1,234",
      rating: 4.9
    }
  ]

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <VideoCameraIcon className="w-4 h-4" />
      case 'PDF':
      case 'Guide':
      case 'Whitepaper':
        return <DocumentTextIcon className="w-4 h-4" />
      case 'Documentation':
        return <BookOpenIcon className="w-4 h-4" />
      default:
        return <DocumentTextIcon className="w-4 h-4" />
    }
  }

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
              <Link to="/features" className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors">Features</Link>
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
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Resources & Documentation
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Everything you need to get the most out of your IT Support Portal. 
            Guides, tutorials, best practices, and technical documentation.
          </p>
        </div>
      </div>

      {/* Popular Resources */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Most Popular Resources</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start with these highly-rated resources that help teams get up and running quickly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularResources.map((resource, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {getTypeIcon(resource.type)}
                    <span className="text-sm text-gray-600">{resource.type}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{resource.downloads} downloads</span>
                    <div className="flex items-center gap-1">
                      <span>★</span>
                      <span>{resource.rating}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Categories */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the resources you need organized by topic and user role.
            </p>
          </div>
          
          <div className="space-y-12">
            {resourceCategories.map((category) => (
              <div key={category.id}>
                <Card className="border border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4 text-2xl text-[#2F327D]">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3>{category.title}</h3>
                        <p className="text-sm text-gray-600 font-normal mt-1">{category.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {category.resources.map((resource, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(resource.type)}
                            <span className="text-xs text-gray-500 uppercase tracking-wide">{resource.type}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <ClockIcon className="w-3 h-3" />
                              {resource.duration}
                            </div>
                            <Button size="sm" variant="outline">
                              {resource.type === 'Video' ? (
                                <PlayIcon className="w-3 h-3 mr-1" />
                              ) : (
                                <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                              )}
                              {resource.type === 'Video' ? 'Watch' : 'Download'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#2F327D] mb-6">
                Need Additional Help?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Can't find what you're looking for? Our support team is here to help you succeed 
                with personalized assistance and training.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <QuestionMarkCircleIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">24/7 technical support available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <VideoCameraIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Live training sessions and webinars</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Dedicated customer success manager</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpenIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Custom training materials for your team</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#2F327D] mb-6">Get Personalized Support</h3>
                <p className="text-gray-600 mb-6">
                  Schedule a consultation with our experts to discuss your specific needs and get customized guidance.
                </p>
                <div className="space-y-4">
                  <Link to="/contact">
                    <Button size="lg" className="w-full">
                      Contact Support Team
                    </Button>
                  </Link>
                  <Link to="/help">
                    <Button size="lg" variant="outline" className="w-full">
                      Browse Help Center
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Average response time: <strong>{"< 2 hours"}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-[#2F327D] mb-4">
                Stay Updated
              </h3>
              <p className="text-gray-600 mb-6">
                Get notified when we publish new resources, guides, and best practices for healthcare IT management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                No spam. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Resources
