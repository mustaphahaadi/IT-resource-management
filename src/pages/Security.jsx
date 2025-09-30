import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  ServerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  KeyIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ClockIcon
} from "@heroicons/react/24/outline"

const Security = () => {
  const securityFeatures = [
    {
      icon: <LockClosedIcon className="w-8 h-8" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
      details: [
        "TLS 1.3 for data in transit",
        "AES-256 encryption for data at rest",
        "Encrypted database connections",
        "Secure API communications"
      ]
    },
    {
      icon: <KeyIcon className="w-8 h-8" />,
      title: "Multi-Factor Authentication",
      description: "Advanced authentication mechanisms to ensure only authorized users access the system.",
      details: [
        "SMS and email verification",
        "Authenticator app support",
        "Hardware security keys",
        "Single Sign-On (SSO) integration"
      ]
    },
    {
      icon: <EyeIcon className="w-8 h-8" />,
      title: "Access Controls",
      description: "Role-based access controls with department-level scoping and audit trails.",
      details: [
        "Role-based permissions",
        "Department-scoped access",
        "Principle of least privilege",
        "Regular access reviews"
      ]
    },
    {
      icon: <DocumentTextIcon className="w-8 h-8" />,
      title: "Audit Logging",
      description: "Comprehensive logging of all system activities for compliance and security monitoring.",
      details: [
        "Complete activity tracking",
        "Tamper-proof log storage",
        "Real-time monitoring",
        "Automated alerting"
      ]
    },
    {
      icon: <ServerIcon className="w-8 h-8" />,
      title: "Infrastructure Security",
      description: "Enterprise-grade cloud infrastructure with multiple layers of security protection.",
      details: [
        "AWS SOC 2 compliant hosting",
        "Network segmentation",
        "DDoS protection",
        "Intrusion detection systems"
      ]
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: "Data Privacy",
      description: "Strict data privacy controls ensuring PHI and sensitive information remain protected.",
      details: [
        "HIPAA compliance",
        "Data minimization practices",
        "Privacy by design",
        "Regular privacy assessments"
      ]
    }
  ]

  const complianceStandards = [
    {
      name: "HIPAA",
      description: "Health Insurance Portability and Accountability Act",
      status: "Compliant",
      details: "Full compliance with Privacy Rule, Security Rule, and Breach Notification Rule"
    },
    {
      name: "SOC 2 Type II",
      description: "Service Organization Control 2",
      status: "Certified",
      details: "Annual audits covering security, availability, processing integrity, confidentiality"
    },
    {
      name: "HITECH",
      description: "Health Information Technology for Economic and Clinical Health Act",
      status: "Compliant",
      details: "Enhanced security and privacy protections for health information"
    },
    {
      name: "GDPR",
      description: "General Data Protection Regulation",
      status: "Compliant",
      details: "European data protection and privacy compliance for international clients"
    }
  ]

  const securityMeasures = [
    {
      category: "Administrative Safeguards",
      icon: <UserGroupIcon className="w-6 h-6" />,
      measures: [
        "Designated Security Officer",
        "Employee security training",
        "Access management procedures",
        "Incident response protocols",
        "Business Associate Agreements",
        "Regular security assessments"
      ]
    },
    {
      category: "Physical Safeguards",
      icon: <LockClosedIcon className="w-6 h-6" />,
      measures: [
        "Secure data center facilities",
        "Biometric access controls",
        "24/7 security monitoring",
        "Environmental controls",
        "Secure media disposal",
        "Workstation security"
      ]
    },
    {
      category: "Technical Safeguards",
      icon: <ServerIcon className="w-6 h-6" />,
      measures: [
        "Access control systems",
        "Audit controls and logging",
        "Data integrity controls",
        "Transmission security",
        "Encryption mechanisms",
        "Automatic logoff"
      ]
    }
  ]

  const securityStats = [
    { number: "99.99%", label: "Security Uptime" },
    { number: "< 1 min", label: "Threat Response Time" },
    { number: "256-bit", label: "Encryption Standard" },
    { number: "24/7", label: "Security Monitoring" }
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
              <span className="font-bold text-lg text-blue-900">IT Support Portal</span>
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
      <div className="bg-gradient-to-br from-green-600 to-green-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Enterprise Security
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Healthcare-grade security with HIPAA compliance, enterprise encryption, and comprehensive audit trails. 
            Your data security is our top priority.
          </p>
        </div>
      </div>

      {/* Security Stats */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Security by the Numbers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our commitment to security is reflected in our performance metrics and industry certifications.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {securityStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">
              Comprehensive Security Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Multi-layered security architecture designed specifically for healthcare environments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-[#2F327D]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* HIPAA Compliance */}
      <div className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              HIPAA Compliance & Healthcare Security
            </h2>
            <p className="text-lg text-green-700 max-w-2xl mx-auto">
              Built from the ground up to meet the stringent security requirements of healthcare organizations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {securityMeasures.map((category, index) => (
              <Card key={index} className="border border-green-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-800">
                    {category.icon}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.measures.map((measure, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {measure}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Standards */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">
              Industry Compliance & Certifications
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We maintain the highest standards of compliance with healthcare and data protection regulations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {complianceStandards.map((standard, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#2F327D] mb-1">{standard.name}</h3>
                      <p className="text-gray-600 text-sm">{standard.description}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {standard.status}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{standard.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Security Monitoring */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#2F327D] mb-6">
                24/7 Security Monitoring
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our security operations center monitors your data around the clock, with automated threat detection 
                and immediate response protocols to protect your healthcare information.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Real-time threat detection and response</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Automated security incident alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Comprehensive audit trail logging</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Global security operations center</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-[#2F327D] mb-4">
                  Security First Approach
                </h3>
                <p className="text-gray-600 mb-6">
                  Every feature is designed with security in mind, ensuring your healthcare data remains protected 
                  at all times while maintaining system usability and performance.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-xs text-gray-500">Security Breaches</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-xs text-gray-500">Uptime SLA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Security Team */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-[#2F327D]">
                Security Questions or Concerns?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-6">
                  Our security team is available 24/7 to address any security concerns or questions about our platform.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-3">Security Team</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Email: security@hospital-it.com</p>
                    <p>Phone: +1 (555) 911-HELP</p>
                    <p>Emergency: 24/7 Response</p>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-3">Compliance Officer</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Email: compliance@hospital-it.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                    <p>Hours: Mon-Fri 8AM-6PM EST</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Link to="/contact">
                  <Button size="lg">
                    Contact Security Team
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Security
