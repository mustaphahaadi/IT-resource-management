import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      name: 'Essential',
      description: 'Perfect for small clinics and medical practices',
      price: { monthly: 1200, annual: 960 },
      features: [
        'Up to 100 IT assets',
        'Basic helpdesk ticketing',
        'Email & chat support',
        '10 user accounts',
        'Basic reporting & analytics',
        'Mobile app access',
        'Knowledge base access',
        'Standard integrations',
        'HIPAA compliance tools'
      ],
      limitations: [
        'No advanced analytics',
        'No custom workflows',
        'No API access'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      description: 'Ideal for medium-sized hospitals and healthcare systems',
      price: { monthly: 3000, annual: 2400 },
      features: [
        'Up to 1,000 IT assets',
        'Advanced helpdesk with SLA management',
        '24/7 priority support',
        '50 user accounts',
        'Advanced analytics & BI',
        'Custom workflows & automation',
        'Full API access',
        'All integrations included',
        'Advanced role-based permissions',
        'Complete audit trails',
        'Custom reports & dashboards',
        'Mobile technician app',
        'Predictive maintenance alerts'
      ],
      limitations: [
        'No white-label options',
        'Standard onboarding'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      description: 'For large hospitals and health systems',
      price: { monthly: 'Custom', annual: 'Custom' },
      features: [
        'Unlimited IT assets',
        'Enterprise ticketing suite',
        '24/7 dedicated support',
        'Unlimited users',
        'Advanced analytics & BI',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager',
        'Custom onboarding',
        'Training programs',
        'SLA guarantees',
        'Multi-tenant support'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales'
    }
  ]

  const addOns = [
    {
      name: 'Advanced Security',
      description: 'Enhanced security features and compliance tools',
      price: '₵400/month'
    },
    {
      name: 'Custom Integrations',
      description: 'Build custom integrations with your existing systems',
      price: '₵1600/month'
    },
    {
      name: 'Training & Onboarding',
      description: 'Comprehensive training program for your team',
      price: '₵8000 one-time'
    },
    {
      name: 'Priority Support',
      description: '24/7 priority support with dedicated team',
      price: '₵3200/month'
    }
  ]

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 30-day free trial for all plans. No credit card required.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, ACH transfers, and can accommodate purchase orders for enterprise clients.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees for Starter and Professional plans. Enterprise plans include complimentary setup and onboarding.'
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer special pricing for non-profit healthcare organizations. Contact our sales team for details.'
    }
  ]

  const getPrice = (plan) => {
    if (plan.price.monthly === 'Custom') return 'Custom'
    return billingCycle === 'monthly' ? `₵${plan.price.monthly}` : `₵${plan.price.annual}`
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your healthcare organization's needs. All plans include core features with no hidden fees.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-white ${billingCycle === 'monthly' ? 'font-semibold' : 'opacity-70'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 bg-white/20 rounded-full p-1 transition-colors"
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-white ${billingCycle === 'annual' ? 'font-semibold' : 'opacity-70'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative border-2 shadow-lg hover:shadow-xl transition-shadow ${
                plan.popular ? 'border-[#2F327D] shadow-2xl' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#2F327D] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl text-[#2F327D] mb-2">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-[#2F327D]">
                      {getPrice(plan)}
                    </span>
                    {plan.price.monthly !== 'Custom' && (
                      <span className="text-gray-600 text-sm">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  <Link to={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                    <Button className={`w-full ${plan.popular ? 'bg-[#2F327D] hover:bg-[#2F327D]/90' : ''}`}>
                      {plan.cta}
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <XMarkIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add-ons Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Add-On Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhance your plan with additional services tailored to your specific needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, index) => (
              <Card key={index} className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-[#2F327D] text-lg">{addon.name}</h3>
                    <span className="text-[#2F327D] font-bold">{addon.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{addon.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Common questions about our pricing and plans.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[#2F327D] mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="bg-gradient-to-r from-[#2F327D] to-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">Need an Enterprise Solution?</h2>
              <p className="text-white/90 mb-6">
                Large healthcare organizations have unique requirements. Our enterprise team will work 
                with you to create a custom solution that fits your specific needs and budget.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-white" />
                  <span>Custom pricing based on your requirements</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-white" />
                  <span>Dedicated account management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-white" />
                  <span>Priority implementation and support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-white" />
                  <span>Custom integrations and workflows</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#2F327D] mb-6">Contact Our Sales Team</h3>
                <p className="text-gray-600 mb-6">
                  Schedule a consultation to discuss your requirements and get a custom quote.
                </p>
                <div className="space-y-4">
                  <Link to="/contact">
                    <Button size="lg" className="w-full">
                      <PhoneIcon className="w-5 h-5 mr-2" />
                      Schedule a Call
                    </Button>
                  </Link>
                  <div className="text-center text-sm text-gray-600">
                    Or email us at{" "}
                    <a href="mailto:sales@itsupportportal.com" className="text-[#2F327D] hover:underline">
                      sales@itsupportportal.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#2F327D] mb-8">Trusted by Healthcare Organizations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-2xl font-bold text-gray-400">50+ Hospitals</div>
            <div className="text-2xl font-bold text-gray-400">200+ Clinics</div>
            <div className="text-2xl font-bold text-gray-400">10,000+ Users</div>
            <div className="text-2xl font-bold text-gray-400">99.9% Uptime</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
