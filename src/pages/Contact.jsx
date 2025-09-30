import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { NativeSelect } from "../components/ui/native-select"
import { 
  WrenchScrewdriverIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const contactMethods = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: '24/7 technical support for urgent issues',
      contact: '+233 30 123 4567',
      availability: 'Available 24/7'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'General inquiries and non-urgent support',
      contact: 'support@ghanahealthit.gov.gh',
      availability: 'Response within 4 hours'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Instant support during business hours',
      contact: 'Available in app',
      availability: 'Mon-Fri 8AM-6PM GMT'
    },
    {
      icon: DocumentTextIcon,
      title: 'Documentation',
      description: 'Comprehensive guides and tutorials',
      contact: 'docs.ghanahealthit.gov.gh',
    }
  ]

  const offices = [
    {
      city: 'Accra',
      address: 'Ministry of Health Building, Ridge',
      zipcode: 'Accra, Greater Accra Region',
      phone: '+233 30 123 4567'
    },
    {
      city: 'Kumasi',
      address: 'Komfo Anokye Teaching Hospital Complex',
      zipcode: 'Kumasi, Ashanti Region',
      phone: '+233 32 987 6543'
    },
    {
      city: 'Tamale',
      address: 'Tamale Teaching Hospital Grounds',
      zipcode: 'Tamale, Northern Region',
      phone: '+233 37 456 7890'
    }
  ]

  const faqs = [
    {
      question: 'How quickly can we get started?',
      answer: 'Most healthcare organizations are up and running within 2-4 weeks, including data migration and staff training.'
    },
    {
      question: 'Is the platform HIPAA compliant?',
      answer: 'Yes, our platform is fully HIPAA compliant with SOC 2 Type II certification and comprehensive audit trails.'
    },
    {
      question: 'Do you offer training for our staff?',
      answer: 'We provide comprehensive training programs including live sessions, documentation, and ongoing support.'
    },
    {
      question: 'Can you integrate with our existing systems?',
      answer: 'Yes, we offer integrations with most major healthcare and IT management systems including Epic, Cerner, and ServiceNow.'
    }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#2F327D] mb-4">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. Our team will get back to you within 24 hours.
            </p>
            <Link to="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Have questions about our platform? Need a demo? Our healthcare IT experts are here to help.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the best way to reach us based on your needs and urgency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <method.icon className="w-12 h-12 text-[#2F327D] mx-auto mb-4" />
                  <CardTitle className="text-lg text-[#2F327D]">{method.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                  <p className="font-semibold text-[#2F327D] text-sm mb-2">{method.contact}</p>
                  <p className="text-xs text-gray-500">{method.availability}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#2F327D] mb-6">Send Us a Message</h2>
              <p className="text-lg text-gray-600 mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
              
              <Card className="border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <Input
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <Input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                        <Input
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          placeholder="Hospital or organization name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type</label>
                      <NativeSelect
                        name="inquiry_type"
                        value={formData.inquiry_type}
                        onChange={handleChange}
                      >
                        <option value="general">General Inquiry</option>
                        <option value="demo">Request Demo</option>
                        <option value="pricing">Pricing Information</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                      </NativeSelect>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <Input
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Brief description of your inquiry"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                      <Textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Please provide details about your inquiry..."
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[#2F327D] mb-6">Our Offices</h3>
              <div className="space-y-6 mb-8">
                {offices.map((office, index) => (
                  <Card key={index} className="border border-gray-200 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="w-5 h-5 text-[#2F327D] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-[#2F327D]">{office.city}</h4>
                          <p className="text-gray-600 text-sm">{office.address}</p>
                          <p className="text-gray-600 text-sm">{office.zipcode}</p>
                          <p className="text-[#2F327D] text-sm font-medium mt-1">{office.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="bg-[#2F327D] rounded-lg p-6 text-white">
                <ClockIcon className="w-8 h-8 mb-4" />
                <h4 className="font-semibold mb-2">Business Hours</h4>
                <div className="space-y-1 text-sm">
                  <p>Monday - Friday: 8:00 AM - 6:00 PM EST</p>
                  <p>Saturday: 9:00 AM - 2:00 PM EST</p>
                  <p>Sunday: Emergency support only</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm">Emergency support available 24/7 for critical healthcare systems.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions about our platform and services.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-[#2F327D] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[#2F327D] mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#2F327D] to-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your IT Operations?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Schedule a personalized demo to see how our platform can benefit your healthcare organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="outline" className="bg-white text-[#2F327D] hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/analytics">
              <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
