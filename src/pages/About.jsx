import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  UsersIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  HeartIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"

const About = () => {
  const team = [
    {
      name: 'Dr. Ama Boateng',
      role: 'Chief Technology Officer',
      bio: '20+ years in healthcare IT, former CIO at Korle-Bu Teaching Hospital, expert in Ghana health data compliance',
      avatar: 'AB'
    },
    {
      name: 'Kwaku Adjei',
      role: 'Lead Software Engineer',
      bio: 'Full-stack developer specializing in healthcare systems, Django/React expert, CISSP certified',
      avatar: 'KA'
    },
    {
      name: 'Efua Asante',
      role: 'Product Manager & UX Lead',
      bio: 'Healthcare operations expert with MBA from University of Ghana, 10+ years in medical technology',
      avatar: 'EA'
    },
    {
      name: 'Yaw Osei',
      role: 'Security & Compliance Officer',
      bio: 'Cybersecurity specialist with focus on healthcare data protection, SOC 2 and Ghana Data Protection Act expert',
      avatar: 'YO'
    },
    {
      name: 'Akosua Frimpong',
      role: 'Customer Success Manager',
      bio: 'Former hospital IT director, specializes in healthcare workflow optimization and training',
      avatar: 'AF'
    },
    {
      name: 'Kofi Mensah',
      role: 'DevOps Engineer',
      bio: 'Cloud infrastructure specialist, AWS certified, expert in healthcare system scalability',
      avatar: 'KM'
    }
  ]

  const values = [
    {
      icon: HeartIcon,
      title: 'Patient-Centered',
      description: 'Every feature we build ultimately serves to improve patient care and safety.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Security First',
      description: 'Healthcare data requires the highest security standards. We never compromise.'
    },
    {
      icon: UsersIcon,
      title: 'Collaboration',
      description: 'We believe the best solutions come from working closely with healthcare professionals.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Continuous Learning',
      description: 'Healthcare technology evolves rapidly. We stay ahead of the curve.'
    }
  ]

  const milestones = [
    { year: '2019', event: 'Company founded by healthcare IT veterans with vision for intelligent helpdesk automation' },
    { year: '2020', event: 'First hospital deployment at Regional Medical Center - 300% improvement in response times' },
    { year: '2021', event: 'HIPAA compliance certification achieved, expanded to 15 healthcare facilities' },
    { year: '2022', event: '100+ healthcare facilities using our platform, launched mobile technician app' },
    { year: '2023', event: 'SOC 2 Type II compliance completed, AI-powered ticket routing introduced' },
    { year: '2024', event: '25,000+ IT assets under management, real-time analytics and predictive maintenance launched' }
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
              <span className="font-bold text-lg text-blue-900">Ghana Health IT Portal</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-[#2F327D] font-medium transition-colors">Features</Link>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About IT Support Portal
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            We're dedicated to transforming healthcare IT management through innovative technology, 
            deep industry expertise, and an unwavering commitment to patient care.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#2F327D] mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To revolutionize healthcare IT support through intelligent automation, comprehensive asset management, 
                and role-based workflows that enhance operational efficiency, ensure security compliance, and ultimately improve patient outcomes.
              </p>
              <p className="text-gray-600 mb-8">
                Founded by healthcare IT professionals who experienced firsthand the challenges of managing 
                technology in critical medical environments, we've built a platform that understands the unique needs of healthcare 
                while delivering enterprise-grade capabilities with the reliability that patient care demands.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2F327D]">25+</div>
                  <div className="text-sm text-gray-600">Ghana Health Facilities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2F327D]">5,000+</div>
                  <div className="text-sm text-gray-600">IT Assets Managed</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <BuildingOfficeIcon className="w-12 h-12 text-[#2F327D] mx-auto mb-4" />
                  <h3 className="font-semibold text-[#2F327D] mb-2">Healthcare Focused</h3>
                  <p className="text-sm text-gray-600">Built specifically for medical environments</p>
                </div>
                <div className="text-center">
                  <GlobeAltIcon className="w-12 h-12 text-[#2F327D] mx-auto mb-4" />
                  <h3 className="font-semibold text-[#2F327D] mb-2">Global Reach</h3>
                  <p className="text-sm text-gray-600">Serving healthcare organizations worldwide</p>
                </div>
                <div className="text-center">
                  <TrophyIcon className="w-12 h-12 text-[#2F327D] mx-auto mb-4" />
                  <h3 className="font-semibold text-[#2F327D] mb-2">Award Winning</h3>
                  <p className="text-sm text-gray-600">Recognized for innovation in healthcare IT</p>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="w-12 h-12 text-[#2F327D] mx-auto mb-4" />
                  <h3 className="font-semibold text-[#2F327D] mb-2">Secure & Compliant</h3>
                  <p className="text-sm text-gray-600">HIPAA and SOC 2 certified platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do, from product development to customer support.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border border-gray-200 shadow-lg">
                <CardHeader>
                  <value.icon className="w-12 h-12 text-[#2F327D] mx-auto mb-4" />
                  <CardTitle className="text-lg text-[#2F327D]">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Healthcare IT experts with decades of combined experience in medical technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-[#2F327D] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {member.avatar}
                  </div>
                  <h3 className="font-semibold text-[#2F327D] mb-1">{member.name}</h3>
                  <div className="text-sm text-gray-600 mb-3">{member.role}</div>
                  <p className="text-xs text-gray-500">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F327D] mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Key milestones in our mission to transform healthcare IT management.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#2F327D] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {milestone.year}
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md flex-1">
                    <p className="text-gray-700">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#2F327D] to-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're a healthcare professional looking for better IT management or a developer 
            passionate about healthcare technology, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="outline" className="bg-white text-[#2F327D] hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
