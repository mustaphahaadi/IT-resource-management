import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  WrenchScrewdriverIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  StarIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "per month",
      description: "Perfect for small healthcare facilities getting started with IT service management.",
      features: [
        "Up to 50 IT assets",
        "Basic ticket management",
        "5 technician accounts",
        "Email support",
        "Standard reporting",
        "Mobile app access",
        "Basic integrations"
      ],
      limitations: [
        "Advanced analytics",
        "Custom workflows",
        "API access",
        "Priority support"
      ],
      popular: false,
      color: "blue"
    },
    {
      name: "Professional",
      price: "$149",
      period: "per month",
      description: "Comprehensive solution for medium-sized healthcare organizations.",
      features: [
        "Up to 500 IT assets",
        "Advanced ticket management",
        "25 technician accounts",
        "Priority email & chat support",
        "Advanced reporting & analytics",
        "Mobile app access",
        "All integrations",
        "Custom workflows",
        "SLA management",
        "Audit trails"
      ],
      limitations: [
        "Dedicated support manager",
        "Custom development"
      ],
      popular: true,
      color: "purple"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Tailored solution for large healthcare systems and hospital networks.",
      features: [
        "Unlimited IT assets",
        "Enterprise ticket management",
        "Unlimited technician accounts",
        "24/7 phone & chat support",
        "Custom reporting & dashboards",
        "Mobile app access",
        "All integrations + custom",
        "Advanced workflows",
        "Enterprise SLA management",
        "Complete audit trails",
        "Dedicated support manager",
        "Custom development",
        "On-premise deployment option",
        "Advanced security features"
      ],
      limitations: [],
      popular: false,
      color: "green"
    }
  ];

  const addOns = [
    {
      name: "Advanced Analytics",
      price: "$29/month",
      description: "Predictive insights and advanced reporting capabilities"
    },
    {
      name: "API Access",
      price: "$19/month",
      description: "Full REST API access for custom integrations"
    },
    {
      name: "Premium Support",
      price: "$99/month",
      description: "24/7 phone support with dedicated account manager"
    },
    {
      name: "Custom Training",
      price: "$199/session",
      description: "Personalized training sessions for your team"
    }
  ];

  const faqs = [
    {
      question: "Can I change plans at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 14-day free trial with full access to Professional plan features. No credit card required."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, ACH transfers, and can accommodate purchase orders for enterprise clients."
    },
    {
      question: "Is the platform HIPAA compliant?",
      answer: "Yes, our platform is fully HIPAA compliant and SOC 2 Type II certified. We maintain the highest security standards."
    },
    {
      question: "Do you offer on-premise deployment?",
      answer: "Yes, on-premise deployment is available for Enterprise clients with specific security or compliance requirements."
    },
    {
      question: "What kind of support is included?",
      answer: "All plans include email support. Professional plans add chat support, and Enterprise includes 24/7 phone support."
    }
  ];

  const getColorClasses = (color, popular = false) => {
    const colors = {
      blue: {
        bg: popular ? "bg-blue-600" : "bg-white",
        text: popular ? "text-white" : "text-blue-600",
        border: "border-blue-200",
        button: "bg-blue-600 hover:bg-blue-700 text-white"
      },
      purple: {
        bg: popular ? "bg-purple-600" : "bg-white",
        text: popular ? "text-white" : "text-purple-600",
        border: "border-purple-200",
        button: "bg-purple-600 hover:bg-purple-700 text-white"
      },
      green: {
        bg: popular ? "bg-green-600" : "bg-white",
        text: popular ? "text-white" : "text-green-600",
        border: "border-green-200",
        button: "bg-green-600 hover:bg-green-700 text-white"
      }
    };
    return colors[color];
  };

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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your healthcare organization. All plans include 
            our core features with no hidden fees or surprise charges.
          </p>
          <div className="flex justify-center">
            <div className="bg-blue-700 rounded-lg p-1 flex">
              <button className="px-6 py-2 bg-white text-blue-600 rounded-md font-medium">
                Monthly
              </button>
              <button className="px-6 py-2 text-blue-100 rounded-md font-medium">
                Annual (Save 20%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const colors = getColorClasses(plan.color, plan.popular);
              return (
                <Card key={index} className={`relative border-2 ${colors.border} ${colors.bg} ${plan.popular ? 'scale-105 shadow-2xl' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                        <StarIcon className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <CardTitle className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {plan.name}
                    </CardTitle>
                    <div className={`${plan.popular ? 'text-white' : 'text-gray-900'} mb-4`}>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={`text-lg ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                        /{plan.period}
                      </span>
                    </div>
                    <p className={`${plan.popular ? 'text-purple-100' : 'text-gray-600'} leading-relaxed`}>
                      {plan.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckIcon className={`w-5 h-5 ${plan.popular ? 'text-purple-200' : 'text-green-600'} flex-shrink-0`} />
                          <span className={`${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                      
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-center gap-3 opacity-50">
                          <XMarkIcon className={`w-5 h-5 ${plan.popular ? 'text-purple-300' : 'text-gray-400'} flex-shrink-0`} />
                          <span className={`${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6">
                      <Button className={`w-full ${colors.button}`} size="lg">
                        {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Optional Add-ons
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enhance your plan with additional features and services tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {addOns.map((addon, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{addon.name}</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-3">{addon.price}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{addon.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get answers to common questions about our pricing and plans.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need Help Choosing?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Chat with Sales
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              <PhoneIcon className="w-5 h-5 mr-2" />
              Schedule Call
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare organizations using IT Support Pro.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Your Free Trial
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
