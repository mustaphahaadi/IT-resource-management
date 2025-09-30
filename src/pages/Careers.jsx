import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"

const Careers = () => {
  const jobOpenings = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      salary: "$140,000 - $180,000",
      description: "Join our engineering team to build the next generation of healthcare IT management tools.",
      requirements: [
        "5+ years experience with React and Node.js",
        "Experience with Django/Python backend development",
        "Healthcare industry experience preferred",
        "Strong understanding of HIPAA compliance"
      ],
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Remote",
      type: "Full-time",
      salary: "$120,000 - $160,000",
      description: "Help us scale our platform to serve thousands of healthcare organizations worldwide.",
      requirements: [
        "Experience with AWS, Docker, and Kubernetes",
        "CI/CD pipeline management",
        "Infrastructure as Code (Terraform)",
        "Security-first mindset"
      ],
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "Product Manager - Healthcare IT",
      department: "Product",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$130,000 - $170,000",
      description: "Drive product strategy and roadmap for our healthcare IT management platform.",
      requirements: [
        "3+ years product management experience",
        "Healthcare or enterprise software background",
        "Strong analytical and communication skills",
        "Experience with Agile methodologies"
      ],
      posted: "3 days ago"
    },
    {
      id: 4,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "New York, NY / Remote",
      type: "Full-time",
      salary: "$90,000 - $120,000",
      description: "Help healthcare organizations maximize value from our platform through onboarding and ongoing support.",
      requirements: [
        "2+ years customer success experience",
        "Healthcare industry knowledge",
        "Excellent communication skills",
        "Project management experience"
      ],
      posted: "5 days ago"
    },
    {
      id: 5,
      title: "Security Engineer",
      department: "Security",
      location: "Remote",
      type: "Full-time",
      salary: "$130,000 - $170,000",
      description: "Ensure our platform meets the highest security standards for healthcare data protection.",
      requirements: [
        "Strong cybersecurity background",
        "HIPAA compliance expertise",
        "Penetration testing experience",
        "Security certifications preferred"
      ],
      posted: "1 week ago"
    },
    {
      id: 6,
      title: "UX/UI Designer",
      department: "Design",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      salary: "$110,000 - $140,000",
      description: "Design intuitive interfaces for healthcare professionals managing critical IT infrastructure.",
      requirements: [
        "3+ years UX/UI design experience",
        "Experience with healthcare or enterprise software",
        "Proficiency in Figma and design systems",
        "User research and testing experience"
      ],
      posted: "4 days ago"
    }
  ]

  const benefits = [
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance plus wellness programs",
      color: "text-red-600"
    },
    {
      icon: <AcademicCapIcon className="w-8 h-8" />,
      title: "Learning & Development",
      description: "$3,000 annual learning budget and conference attendance support",
      color: "text-blue-600"
    },
    {
      icon: <GlobeAltIcon className="w-8 h-8" />,
      title: "Remote-First Culture",
      description: "Work from anywhere with flexible hours and home office stipend",
      color: "text-green-600"
    },
    {
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      title: "Competitive Compensation",
      description: "Market-rate salaries plus equity and performance bonuses",
      color: "text-yellow-600"
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: "Work-Life Balance",
      description: "Unlimited PTO, sabbatical options, and mental health support",
      color: "text-purple-600"
    },
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      title: "Innovation Time",
      description: "20% time for personal projects and innovation initiatives",
      color: "text-indigo-600"
    }
  ]

  const companyValues = [
    {
      title: "Patient-Centered Innovation",
      description: "Every feature we build ultimately serves to improve patient care and safety in healthcare environments."
    },
    {
      title: "Security & Compliance First",
      description: "We never compromise on security and maintain the highest standards for healthcare data protection."
    },
    {
      title: "Collaborative Excellence",
      description: "We believe the best solutions come from diverse teams working together with healthcare professionals."
    },
    {
      title: "Continuous Learning",
      description: "Healthcare technology evolves rapidly, and we invest in our team's growth to stay ahead of the curve."
    }
  ]

  const offices = [
    {
      city: "San Francisco",
      address: "123 Healthcare Blvd, Suite 400",
      description: "Our headquarters in the heart of the tech industry",
      image: "/api/placeholder/300/200"
    },
    {
      city: "New York",
      address: "456 Medical Center Dr, Floor 12",
      description: "East coast hub serving major healthcare systems",
      image: "/api/placeholder/300/200"
    },
    {
      city: "Remote",
      address: "Work from anywhere",
      description: "Join our distributed team from around the world",
      image: "/api/placeholder/300/200"
    }
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
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <BriefcaseIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join Our Mission
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Help us transform healthcare IT management and improve patient care through innovative technology. 
            Build your career with a team that's making a real difference.
          </p>
        </div>
      </div>

      {/* Company Values */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and shape our company culture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companyValues.map((value, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#2F327D] mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Why Work With Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive benefits and a supportive environment to help you thrive both personally and professionally.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 ${benefit.color}`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our growing team and help shape the future of healthcare IT management.
            </p>
          </div>
          
          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <Card key={job.id} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <h3 className="text-xl font-semibold text-[#2F327D]">{job.title}</h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {job.department}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          {job.salary}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{job.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Key Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Posted {job.posted}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 lg:ml-6">
                      <Button className="w-full lg:w-auto">
                        Apply Now
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" className="w-full lg:w-auto">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Offices */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Our Locations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Work from our offices or join our remote-first culture from anywhere in the world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-[#2F327D] mb-2">{office.city}</h3>
                  <p className="text-gray-600 text-sm mb-3">{office.address}</p>
                  <p className="text-gray-700 text-sm">{office.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Our Hiring Process</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've designed a transparent and efficient process to help you showcase your skills and learn about our team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Application Review",
                description: "We review your application and resume within 3-5 business days."
              },
              {
                step: "2",
                title: "Initial Screen",
                description: "30-minute call with our recruiting team to discuss your background and interests."
              },
              {
                step: "3",
                title: "Technical Interview",
                description: "Role-specific technical assessment with team members you'd work with."
              },
              {
                step: "4",
                title: "Final Interview",
                description: "Meet with leadership and discuss culture fit, career goals, and next steps."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-[#2F327D] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-[#2F327D] to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Don't see a perfect fit? We're always looking for talented individuals who share our passion for healthcare technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-[#2F327D] hover:bg-gray-100">
              View All Openings
            </Button>
            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-[#2F327D] mb-4">
                Questions About Working Here?
              </h3>
              <p className="text-gray-600 mb-6">
                Our People team is here to answer any questions about roles, culture, benefits, or the application process.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Email us at</p>
                  <a href="mailto:careers@hospital-it.com" className="text-[#2F327D] font-medium hover:underline">
                    careers@hospital-it.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Or connect with us</p>
                  <div className="flex justify-center gap-4 mt-2">
                    <a href="#" className="text-[#2F327D] hover:underline text-sm">LinkedIn</a>
                    <a href="#" className="text-[#2F327D] hover:underline text-sm">Glassdoor</a>
                    <a href="#" className="text-[#2F327D] hover:underline text-sm">AngelList</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Careers
