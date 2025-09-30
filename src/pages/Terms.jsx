import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ScaleIcon,
  UserIcon,
  CreditCardIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"

const Terms = () => {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <DocumentTextIcon className="w-6 h-6" />,
      content: [
        {
          text: "By accessing or using the IT Support Portal platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service."
        },
        {
          text: "These terms apply to all users of the service, including healthcare organizations, IT personnel, administrators, and end users who access the platform through their organization's subscription."
        }
      ]
    },
    {
      id: "service-description",
      title: "Service Description",
      icon: <WrenchScrewdriverIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Platform Overview",
          text: "IT Support Portal provides a comprehensive healthcare IT management platform including helpdesk ticketing, asset management, task assignment, user management, and analytics capabilities designed specifically for healthcare environments."
        },
        {
          subtitle: "Service Availability",
          text: "We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be announced in advance, and emergency maintenance may occur with minimal notice."
        },
        {
          subtitle: "Feature Updates",
          text: "We regularly update and improve our platform. New features may be added, and existing features may be modified or discontinued with reasonable notice to users."
        }
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts & Registration",
      icon: <UserIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Account Creation",
          text: "To use our services, you must create an account through your organization's administrator or through our registration process. You must provide accurate, current, and complete information during registration."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account."
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to terminate or suspend accounts that violate these terms, engage in fraudulent activity, or pose a security risk to our platform or other users."
        }
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Permitted Uses",
          text: "You may use our platform solely for legitimate healthcare IT management purposes within your organization, in compliance with all applicable laws and regulations, including HIPAA."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You may not use our platform to: (a) violate any laws or regulations; (b) transmit malicious code or conduct security attacks; (c) interfere with platform operations; (d) access unauthorized data; (e) share account credentials; or (f) use the service for non-healthcare purposes."
        },
        {
          subtitle: "Data Integrity",
          text: "You are responsible for the accuracy and integrity of data you input into the system. You must not input false, misleading, or corrupted data that could affect system operations or other users."
        }
      ]
    },
    {
      id: "data-privacy",
      title: "Data Privacy & Security",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "HIPAA Compliance",
          text: "Our platform is designed to comply with HIPAA regulations. We will enter into Business Associate Agreements (BAAs) with covered entities as required by law."
        },
        {
          subtitle: "Data Ownership",
          text: "You retain ownership of all data you input into our platform. We do not claim ownership rights to your healthcare or organizational data."
        },
        {
          subtitle: "Data Security",
          text: "We implement industry-standard security measures to protect your data, including encryption, access controls, and regular security audits. However, no system is 100% secure, and you acknowledge the inherent risks of electronic data transmission."
        }
      ]
    },
    {
      id: "payment-terms",
      title: "Payment Terms",
      icon: <CreditCardIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Subscription Fees",
          text: "Our services are provided on a subscription basis. Fees are charged according to your selected plan and billing cycle (monthly or annual). All fees are non-refundable except as required by law."
        },
        {
          subtitle: "Payment Processing",
          text: "Payments are processed through secure third-party payment processors. You authorize us to charge your designated payment method for all applicable fees."
        },
        {
          subtitle: "Late Payments",
          text: "If payment is not received when due, we may suspend your access to the platform until payment is made. Accounts with payments more than 30 days overdue may be terminated."
        },
        {
          subtitle: "Price Changes",
          text: "We may change our pricing with 30 days' notice. Price changes will not affect your current billing cycle but will apply to subsequent renewals."
        }
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: <DocumentTextIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Platform Rights",
          text: "The IT Support Portal platform, including all software, designs, text, graphics, and other content, is owned by us and protected by copyright, trademark, and other intellectual property laws."
        },
        {
          subtitle: "License Grant",
          text: "We grant you a limited, non-exclusive, non-transferable license to use our platform solely for your internal healthcare IT management purposes during your subscription term."
        },
        {
          subtitle: "User Content",
          text: "You retain rights to content you create using our platform, but you grant us a license to host, store, and process such content as necessary to provide our services."
        }
      ]
    },
    {
      id: "liability-disclaimers",
      title: "Liability & Disclaimers",
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Service Disclaimers",
          text: "Our platform is provided 'as is' without warranties of any kind. We do not guarantee that the service will be error-free, secure, or continuously available."
        },
        {
          subtitle: "Limitation of Liability",
          text: "To the maximum extent permitted by law, our liability for any damages arising from your use of our platform shall not exceed the amount you paid for the service in the 12 months preceding the claim."
        },
        {
          subtitle: "Healthcare Decisions",
          text: "Our platform is a management tool and should not be used as the sole basis for healthcare decisions. Healthcare professionals remain responsible for all clinical and operational decisions."
        }
      ]
    },
    {
      id: "termination",
      title: "Termination",
      icon: <XCircleIcon className="w-6 h-6" />,
      content: [
        {
          subtitle: "Termination by You",
          text: "You may terminate your subscription at any time through your account settings or by contacting our support team. Termination will be effective at the end of your current billing period."
        },
        {
          subtitle: "Termination by Us",
          text: "We may terminate your access immediately for violations of these terms, non-payment, or if we discontinue the service. We will provide reasonable notice except in cases of serious violations."
        },
        {
          subtitle: "Data Retention",
          text: "Upon termination, we will retain your data for 90 days to allow for data export, after which it will be securely deleted unless legally required to retain it longer."
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
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <ScaleIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            These terms govern your use of our healthcare IT management platform. 
            Please read them carefully to understand your rights and obligations.
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
                <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Agreement Overview</h2>
                  <p className="text-gray-600 leading-relaxed">
                    These Terms of Service ("Terms") constitute a legal agreement between you and IT Support Portal 
                    regarding your use of our healthcare IT management platform. These terms are designed to protect 
                    both our users and our service while ensuring compliance with healthcare industry regulations 
                    and standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Sections */}
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
                      {item.subtitle && (
                        <h4 className="font-semibold text-gray-900 mb-2">{item.subtitle}</h4>
                      )}
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Governing Law */}
          <Card className="mt-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-purple-800">
                <ScaleIcon className="w-6 h-6" />
                Governing Law & Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-purple-800">
                <div>
                  <h4 className="font-semibold mb-2">Governing Law</h4>
                  <p className="text-sm">
                    These Terms are governed by the laws of the State of California, without regard to conflict of law principles. 
                    Any disputes arising from these Terms or your use of our services will be subject to the exclusive jurisdiction 
                    of the courts located in San Francisco County, California.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                  <p className="text-sm">
                    Before filing any legal action, parties agree to attempt resolution through good faith negotiations. 
                    If unsuccessful, disputes may be resolved through binding arbitration under the rules of the American 
                    Arbitration Association.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-[#2F327D]">Questions About These Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Legal Department</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: legal@hospital-it.com</p>
                      <p>Phone: +1 (555) 123-4567</p>
                      <p>Address: 123 Healthcare Blvd, Suite 400<br />San Francisco, CA 94105</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Support</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: support@hospital-it.com</p>
                      <p>Phone: +1 (555) 123-4567</p>
                      <p>Hours: 24/7 Support Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Updates */}
          <Card className="mt-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Changes to Terms</h3>
                  <p className="text-yellow-700 text-sm">
                    We may modify these Terms of Service from time to time. We will notify users of material changes 
                    via email and platform notifications at least 30 days before they take effect. Your continued use 
                    of our services after such modifications constitutes acceptance of the updated terms.
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

export default Terms
