import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { WrenchScrewdriverIcon, ShieldCheckIcon, ChartBarIcon, HeartIcon } from "@heroicons/react/24/outline";

const About = () => {
  const values = [
    {
      name: "Innovation",
      description: "Continuously advancing healthcare IT through cutting-edge technology and intelligent automation.",
      icon: WrenchScrewdriverIcon,
      bgColor: "bg-blue-600"
    },
    {
      name: "Reliability",
      description: "Providing 99.9% uptime and enterprise-grade security for mission-critical healthcare operations.",
      icon: ShieldCheckIcon,
      bgColor: "bg-green-600"
    },
    {
      name: "Excellence",
      description: "Delivering exceptional service and support to healthcare organizations worldwide.",
      icon: ChartBarIcon,
      bgColor: "bg-purple-600"
    },
    {
      name: "Compassion",
      description: "Understanding the critical role of IT in patient care and healthcare delivery.",
      icon: HeartIcon,
      bgColor: "bg-red-600"
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Executive Officer",
      bio: "Former CIO at Johns Hopkins with 15+ years in healthcare IT transformation.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      bio: "Ex-Microsoft architect specializing in enterprise healthcare solutions.",
      avatar: "MC"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Chief Medical Officer",
      bio: "Practicing physician and healthcare informatics expert with 20+ years experience.",
      avatar: "AP"
    },
    {
      name: "David Rodriguez",
      role: "VP of Engineering",
      bio: "Former Google engineer with expertise in scalable healthcare infrastructure.",
      avatar: "DR"
    }
  ];

  const milestones = [
    { year: "2018", event: "Company founded with mission to transform healthcare IT" },
    { year: "2019", event: "First 100 healthcare facilities onboarded" },
    { year: "2020", event: "Rapid expansion during global health crisis" },
    { year: "2021", event: "Achieved SOC 2 Type II compliance" },
    { year: "2022", event: "Reached 1,000+ healthcare organizations" },
    { year: "2023", event: "Launched AI-powered automation features" },
    { year: "2024", event: "Serving 10,000+ IT assets globally" }
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
            About IT Support Pro
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We're on a mission to revolutionize healthcare IT service management through 
            intelligent automation, enterprise-grade security, and exceptional user experience.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To empower healthcare organizations worldwide with the most advanced, 
                secure, and user-friendly IT service management platform. We believe 
                that exceptional IT support is critical to delivering quality patient care.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform combines cutting-edge technology with deep healthcare industry 
                expertise to solve the unique challenges faced by IT teams in medical environments.
              </p>
              <div className="flex items-center gap-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <span className="text-gray-700">HIPAA Compliant & SOC 2 Certified</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                  <div className="text-gray-600">IT Assets Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1,000+</div>
                  <div className="text-gray-600">Healthcare Facilities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-gray-600">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-600">Expert Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we serve 
              healthcare organizations around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{value.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our experienced leadership team combines deep healthcare knowledge 
              with cutting-edge technology expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{member.avatar}</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{member.name}</CardTitle>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From startup to industry leader, here's how we've grown to serve 
              healthcare organizations worldwide.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center mb-8 last:mb-0">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{milestone.year}</span>
                </div>
                <div className="ml-8 bg-gray-800 rounded-xl p-6 flex-1">
                  <p className="text-white text-lg">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover how IT Support Pro can transform your healthcare IT operations.
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
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
