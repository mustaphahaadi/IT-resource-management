import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  EyeIcon,
  UserIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"

const Privacy = () => {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <UserIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect personal information that you provide directly to us, including name, email address, phone number, job title, department, and organization details when you register for our services."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you use our platform, including login times, features accessed, system performance data, and interaction patterns to improve our services."
        },
        {
          subtitle: "Technical Information",
          text: "We collect technical data such as IP addresses, browser type, device information, and system logs for security monitoring and troubleshooting purposes."
        },
        {
          subtitle: "Healthcare Data",
          text: "Our platform may process Protected Health Information (PHI) and other healthcare-related data in accordance with HIPAA regulations and your organization's data processing agreements."
        }
      ]
    },
    {
      id: "data-usage",
      title: "How We Use Your Information",
      icon: <EyeIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our IT helpdesk services, including user authentication, ticket management, and system administration."
        },
        {
          subtitle: "Communication",
          text: "We use your contact information to send service notifications, system alerts, security updates, and respond to your support requests."
        },
        {
          subtitle: "Security & Compliance",
          text: "We process data to maintain system security, prevent unauthorized access, conduct security audits, and ensure compliance with healthcare regulations."
        },
        {
          subtitle: "Analytics & Improvement",
          text: "We analyze usage patterns and system performance to improve our services, develop new features, and optimize user experience while maintaining data privacy."
        }
      ]
    },
    {
      id: "data-protection",
      title: "Data Protection & Security",
      icon: <LockClosedIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Database connections and API communications are secured with industry-standard protocols."
        },
        {
          subtitle: "Access Controls",
          text: "We implement role-based access controls, multi-factor authentication, and regular access reviews to ensure only authorized personnel can access your data."
        },
        {
          subtitle: "HIPAA Compliance",
          text: "Our platform is designed to comply with HIPAA regulations, including administrative, physical, and technical safeguards for Protected Health Information (PHI)."
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits, vulnerability assessments, and compliance reviews to maintain the highest standards of data protection."
        }
      ]
    },
    {
      id: "data-sharing",
      title: "Information Sharing",
      icon: <GlobeAltIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "No Sale of Data",
          text: "We do not sell, rent, or trade your personal information to third parties for marketing purposes. Your data remains confidential and is used solely for service provision."
        },
        {
          subtitle: "Service Providers",
          text: "We may share data with trusted service providers who assist in platform operations, such as cloud hosting providers, but only under strict confidentiality agreements."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, court order, or government regulation, or to protect our rights, property, or safety of our users."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, user data may be transferred as part of the transaction, subject to the same privacy protections."
        }
      ]
    },
    {
      id: "user-rights",
      title: "Your Rights & Choices",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Access & Correction",
          text: "You have the right to access, update, or correct your personal information through your account settings or by contacting our support team."
        },
        {
          subtitle: "Data Portability",
          text: "You can request a copy of your data in a structured, machine-readable format for transfer to another service provider."
        },
        {
          subtitle: "Deletion Rights",
          text: "You may request deletion of your personal information, subject to legal and contractual obligations. Some data may be retained for compliance purposes."
        },
        {
          subtitle: "Opt-Out Options",
          text: "You can opt out of non-essential communications and adjust notification preferences through your account settings."
        }
      ]
    },
    {
      id: "cookies-tracking",
      title: "Cookies & Tracking",
      icon: <DocumentTextIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use essential cookies for authentication, session management, and security features that are necessary for the platform to function properly."
        },
        {
          subtitle: "Analytics Cookies",
          text: "We use analytics cookies to understand how users interact with our platform, helping us improve performance and user experience."
        },
        {
          subtitle: "Cookie Management",
          text: "You can manage cookie preferences through your browser settings, though disabling essential cookies may affect platform functionality."
        },
        {
          subtitle: "Third-Party Tracking",
          text: "We do not use third-party advertising trackers or social media pixels that could compromise your privacy or healthcare data security."
        }
      ]
    }
  ]

  const lastUpdated = "December 15, 2024"

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
              <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your privacy and data security are our top priorities. Learn how we protect and handle your information 
            in compliance with HIPAA and healthcare industry standards.
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-800">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Notice</h2>
                  <p className="text-gray-600 leading-relaxed">
                    This Privacy Policy describes how Ghana Health IT Portal ("we," "our," or "us") collects, uses, and protects 
                    your information when you use our healthcare IT management platform. As a healthcare technology provider in Ghana, 
                    we are committed to maintaining the highest standards of data privacy and security, including full 
                    compliance with Ghana's Data Protection Act 2012 and other applicable healthcare privacy laws.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Policy Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <Card key={section.id} className="border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-[#2F327D]">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-gray-900 mb-2">{item.subtitle}</h4>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* HIPAA Compliance Section */}
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-green-800">
                <ShieldCheckIcon className="w-6 h-6" />
                HIPAA Compliance Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-green-800">
                <p>
                  As a healthcare technology provider, we are committed to full compliance with the Health Insurance 
                  Portability and Accountability Act (HIPAA) and its implementing regulations, including the Privacy Rule, 
                  Security Rule, and Breach Notification Rule.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Administrative Safeguards</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Designated Privacy Officer</li>
                      <li>• Employee training programs</li>
                      <li>• Access management procedures</li>
                      <li>• Incident response protocols</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Technical Safeguards</h4>
                    <ul className="text-sm space-y-1">
                      <li>• End-to-end encryption</li>
                      <li>• Multi-factor authentication</li>
                      <li>• Audit logging and monitoring</li>
                      <li>• Secure data transmission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-[#2F327D]">Contact Us About Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Privacy Officer</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: privacy@ghanahealthit.gov.gh</p>
                      <p>Phone: +233 30 123 4567</p>
                      <p>Address: Ministry of Health Building, Ridge<br />Accra, Greater Accra Region</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Protection</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: security@ghanahealthit.gov.gh</p>
                      <p>Emergency: +233 30 911 4357</p>
                      <p>Response Time: Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card className="mt-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Policy Updates</h3>
                  <p className="text-yellow-700 text-sm">
                    We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. 
                    We will notify users of significant changes via email and platform notifications. Your continued use of 
                    our services after such modifications constitutes acceptance of the updated policy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Privacy
