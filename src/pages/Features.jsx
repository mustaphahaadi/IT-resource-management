import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  BoltIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  ServerIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  BellIcon
} from "@heroicons/react/24/outline";

const Features = () => {
  const coreFeatures = [
    {
      name: "Smart Ticket Management",
      description: "Intelligent routing, auto-categorization, and SLA management with real-time tracking.",
      icon: ExclamationTriangleIcon,
      bgColor: "bg-blue-600",
      features: [
        "Auto-categorization and priority assignment",
        "Intelligent routing to right technician",
        "SLA tracking and violation alerts",
        "Real-time status updates",
        "Mobile-friendly interface"
      ]
    },
    {
      name: "Asset Lifecycle Management",
      description: "Complete IT asset tracking from procurement to disposal with maintenance scheduling.",
      icon: ComputerDesktopIcon,
      bgColor: "bg-green-600",
      features: [
        "Comprehensive asset inventory",
        "Maintenance scheduling and tracking",
        "Warranty and license management",
        "Cost tracking and depreciation",
        "Barcode and QR code scanning"
      ]
    },
    {
      name: "Workflow Automation",
      description: "Intelligent task assignment with workload balancing and skill-based routing.",
      icon: BoltIcon,
      bgColor: "bg-purple-600",
      features: [
        "Skill-based task assignment",
        "Workload balancing algorithms",
        "Automated escalation workflows",
        "Follow-up task generation",
        "Custom workflow builder"
      ]
    },
    {
      name: "Team Collaboration",
      description: "Role-based access control with approval workflows and team communication tools.",
      icon: UsersIcon,
      bgColor: "bg-orange-600",
      features: [
        "Role-based permissions system",
        "Team chat and collaboration",
        "Approval workflows",
        "Department-based scoping",
        "User activity tracking"
      ]
    },
    {
      name: "Advanced Analytics",
      description: "Real-time dashboards with performance metrics, trends, and predictive insights.",
      icon: ChartBarIcon,
      bgColor: "bg-indigo-600",
      features: [
        "Real-time performance dashboards",
        "SLA compliance reporting",
        "Trend analysis and forecasting",
        "Custom report builder",
        "Data export capabilities"
      ]
    },
    {
      name: "Enterprise Security",
      description: "HIPAA-compliant platform with advanced security features and audit trails.",
      icon: ShieldCheckIcon,
      bgColor: "bg-red-600",
      features: [
        "HIPAA compliance and SOC 2 certification",
        "Multi-factor authentication",
        "Complete audit trails",
        "Data encryption at rest and in transit",
        "Role-based access controls"
      ]
    }
  ];

  const additionalFeatures = [
    {
      name: "24/7 System Monitoring",
      description: "Continuous monitoring with automated alerts and health checks.",
      icon: ServerIcon,
      bgColor: "bg-blue-500"
    },
    {
      name: "Mobile Applications",
      description: "Native iOS and Android apps for technicians on the go.",
      icon: DevicePhoneMobileIcon,
      bgColor: "bg-green-500"
    },
    {
      name: "Knowledge Base",
      description: "Searchable documentation and solution database.",
      icon: DocumentTextIcon,
      bgColor: "bg-purple-500"
    },
    {
      name: "Smart Notifications",
      description: "Multi-channel notifications with intelligent routing.",
      icon: BellIcon,
      bgColor: "bg-orange-500"
    },
    {
      name: "Cloud Infrastructure",
      description: "Scalable cloud hosting with 99.9% uptime guarantee.",
      icon: CloudIcon,
      bgColor: "bg-indigo-500"
    },
    {
      name: "API Integration",
      description: "RESTful APIs for seamless third-party integrations.",
      icon: CogIcon,
      bgColor: "bg-red-500"
    }
  ];

  const integrations = [
    { name: "Epic EHR", category: "Healthcare" },
    { name: "Cerner", category: "Healthcare" },
    { name: "Active Directory", category: "Identity" },
    { name: "ServiceNow", category: "ITSM" },
    { name: "Slack", category: "Communication" },
    { name: "Microsoft Teams", category: "Communication" },
    { name: "Salesforce", category: "CRM" },
    { name: "Jira", category: "Project Management" }
  ];

  const benefits = [
    "Reduce ticket resolution time by 60%",
    "Improve technician productivity by 40%",
    "Achieve 99.5% SLA compliance",
    "Decrease IT operational costs by 30%",
    "Enhance user satisfaction scores by 50%",
    "Streamline asset management processes"
  ];

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
              <span className="font-bold text-lg text-blue-900">IT Support Pro</span>
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
      <div className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Powerful Features for Modern IT Teams
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover the comprehensive suite of tools designed to streamline your 
            healthcare IT operations and enhance team productivity.
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Core Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage IT services efficiently in healthcare environments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
                <CardHeader className="pb-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{feature.name}</CardTitle>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Additional Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Extended features that make IT Support Pro the most comprehensive platform available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Measurable Results
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Healthcare organizations using IT Support Pro see significant improvements 
                in efficiency, cost savings, and user satisfaction.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">60%</div>
                  <div className="text-blue-100">Faster Resolution</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99.9%</div>
                  <div className="text-blue-100">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">40%</div>
                  <div className="text-blue-100">Cost Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">95%</div>
                  <div className="text-blue-100">User Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with your existing tools and systems for a unified workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors">
                <div className="text-white font-bold text-lg mb-2">{integration.name}</div>
                <div className="text-gray-400 text-sm">{integration.category}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">And 100+ more integrations available</p>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              View All Integrations
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see how IT Support Pro can transform your operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
