import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  WrenchScrewdriverIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import AsyncSelect from '../components/ui/AsyncSelect'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      name: "Sales Inquiries",
      description: "Learn about our platform and pricing options",
      icon: ChatBubbleLeftRightIcon,
      contact: "sales@itsupportpro.com",
      phone: "+1 (555) 123-4567",
      bgColor: "bg-blue-600"
    },
    {
      name: "Technical Support",
      description: "Get help with your existing account and technical issues",
      icon: CogIcon,
      contact: "support@itsupportpro.com",
      phone: "+1 (555) 234-5678",
      bgColor: "bg-green-600"
    },
    {
      name: "General Questions",
      description: "Any other questions or feedback",
      icon: QuestionMarkCircleIcon,
      contact: "info@itsupportpro.com",
      phone: "+1 (555) 345-6789",
      bgColor: "bg-purple-600"
    }
  ];

  const offices = [
    {
      city: "San Francisco",
      address: "123 Healthcare Ave, Suite 100",
      zipCode: "San Francisco, CA 94105",
      phone: "+1 (555) 123-4567",
      isHeadquarters: true
    },
    {
      city: "New York",
      address: "456 Medical Plaza, Floor 15",
      zipCode: "New York, NY 10001",
      phone: "+1 (555) 234-5678",
      isHeadquarters: false
    },
    {
      city: "London",
      address: "789 Health Street, Suite 200",
      zipCode: "London, UK EC1A 1BB",
      phone: "+44 20 7123 4567",
      isHeadquarters: false
    }
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
            Contact Our Team
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Get in touch with our experts to learn how IT Support Pro can transform 
            your healthcare IT operations. We're here to help you succeed.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How Can We Help?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the best way to reach us based on your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${method.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">{method.name}</CardTitle>
                  <p className="text-gray-600">{method.description}</p>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span className="text-sm">{method.contact}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <PhoneIcon className="w-4 h-4" />
                    <span className="text-sm">{method.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full"
                      placeholder="john@hospital.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <Input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="General Hospital"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <AsyncSelect
                    options={[
                      { value: 'general', label: 'General Inquiry' },
                      { value: 'sales', label: 'Sales & Pricing' },
                      { value: 'support', label: 'Technical Support' },
                      { value: 'partnership', label: 'Partnership' },
                      { value: 'demo', label: 'Request Demo' }
                    ]}
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full"
                    placeholder="Tell us more about your needs..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Our Offices
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Visit us at one of our global locations or reach out remotely.
              </p>

              <div className="space-y-6">
                {offices.map((office, index) => (
                  <Card key={index} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPinIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{office.city}</h4>
                            {office.isHeadquarters && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                Headquarters
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-1">{office.address}</p>
                          <p className="text-gray-600 mb-3">{office.zipCode}</p>
                          <div className="flex items-center gap-2 text-gray-700">
                            <PhoneIcon className="w-4 h-4" />
                            <span className="text-sm">{office.phone}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Business Hours */}
              <Card className="border border-gray-200 shadow-sm mt-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                    <CardTitle className="text-lg">Business Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Support</span>
                      <span className="font-medium text-green-600">24/7 Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about our platform and services.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  How quickly can we get started?
                </h4>
                <p className="text-gray-600">
                  Most organizations are up and running within 24-48 hours. Our team provides 
                  white-glove onboarding and data migration support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  Is the platform HIPAA compliant?
                </h4>
                <p className="text-gray-600">
                  Yes, we are fully HIPAA compliant and SOC 2 Type II certified. 
                  We maintain the highest security standards for healthcare data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  What integrations are available?
                </h4>
                <p className="text-gray-600">
                  We integrate with major EHR systems, Active Directory, ServiceNow, 
                  and 100+ other healthcare and IT management tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  Do you offer training and support?
                </h4>
                <p className="text-gray-600">
                  Yes, we provide comprehensive training, 24/7 support, and dedicated 
                  customer success managers for enterprise clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
