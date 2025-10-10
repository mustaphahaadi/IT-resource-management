import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  WrenchScrewdriverIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  CodeBracketIcon,
  CogIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      name: "Getting Started",
      description: "Quick start guides and initial setup instructions",
      icon: BookOpenIcon,
      color: "bg-blue-600",
      articles: [
        { title: "Platform Overview", time: "5 min read" },
        { title: "Initial Setup Guide", time: "10 min read" },
        { title: "User Account Creation", time: "3 min read" },
        { title: "First Steps Checklist", time: "7 min read" }
      ]
    },
    {
      name: "User Guides",
      description: "Comprehensive guides for end users and technicians",
      icon: UserGroupIcon,
      color: "bg-green-600",
      articles: [
        { title: "Submitting Support Requests", time: "4 min read" },
        { title: "Tracking Ticket Status", time: "3 min read" },
        { title: "Using the Mobile App", time: "6 min read" },
        { title: "Self-Service Portal", time: "5 min read" }
      ]
    },
    {
      name: "Administrator Guide",
      description: "System administration and configuration guides",
      icon: CogIcon,
      color: "bg-purple-600",
      articles: [
        { title: "User Management", time: "8 min read" },
        { title: "Role-Based Permissions", time: "10 min read" },
        { title: "System Configuration", time: "12 min read" },
        { title: "Backup and Recovery", time: "15 min read" }
      ]
    },
    {
      name: "API Documentation",
      description: "REST API reference and integration guides",
      icon: CodeBracketIcon,
      color: "bg-orange-600",
      articles: [
        { title: "API Authentication", time: "6 min read" },
        { title: "Endpoints Reference", time: "20 min read" },
        { title: "Integration Examples", time: "15 min read" },
        { title: "Webhooks Guide", time: "8 min read" }
      ]
    },
    {
      name: "Security & Compliance",
      description: "Security features and compliance information",
      icon: ShieldCheckIcon,
      color: "bg-red-600",
      articles: [
        { title: "HIPAA Compliance", time: "12 min read" },
        { title: "Security Best Practices", time: "10 min read" },
        { title: "Audit Trails", time: "7 min read" },
        { title: "Data Encryption", time: "8 min read" }
      ]
    },
    {
      name: "Analytics & Reporting",
      description: "Reporting features and analytics guides",
      icon: ChartBarIcon,
      color: "bg-indigo-600",
      articles: [
        { title: "Dashboard Overview", time: "5 min read" },
        { title: "Custom Reports", time: "12 min read" },
        { title: "Performance Metrics", time: "8 min read" },
        { title: "Data Export", time: "6 min read" }
      ]
    }
  ];

  const quickLinks = [
    { title: "System Requirements", icon: DocumentTextIcon },
    { title: "Installation Guide", icon: CogIcon },
    { title: "Troubleshooting", icon: QuestionMarkCircleIcon },
    { title: "Release Notes", icon: DocumentTextIcon },
    { title: "Video Tutorials", icon: PlayCircleIcon },
    { title: "API Reference", icon: CodeBracketIcon }
  ];

  const popularArticles = [
    {
      title: "How to Submit a Support Request",
      category: "User Guides",
      views: "12.5k views",
      time: "4 min read"
    },
    {
      title: "Setting Up Role-Based Permissions",
      category: "Administrator Guide",
      views: "8.2k views",
      time: "10 min read"
    },
    {
      title: "API Authentication Methods",
      category: "API Documentation",
      views: "6.8k views",
      time: "6 min read"
    },
    {
      title: "HIPAA Compliance Features",
      category: "Security & Compliance",
      views: "5.9k views",
      time: "12 min read"
    },
    {
      title: "Creating Custom Reports",
      category: "Analytics & Reporting",
      views: "4.7k views",
      time: "12 min read"
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
            Documentation Center
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Everything you need to know about using IT Support Pro effectively. 
            Find guides, tutorials, and reference materials for all user types.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
                <CardContent className="p-4 text-center">
                  <link.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{link.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Documentation Categories */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the information you need organized by topic and user type.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{category.name}</CardTitle>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.articles.map((article, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <span className="text-gray-900 font-medium">{article.title}</span>
                        <span className="text-sm text-gray-500">{article.time}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">
                    View All Articles
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Popular Articles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most viewed and helpful articles from our documentation.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {popularArticles.map((article, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{article.time}</span>
                        <span>•</span>
                        <span>{article.views}</span>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Video Tutorials
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn visually with our comprehensive video tutorial library.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Platform Overview", duration: "5:30", thumbnail: "overview" },
              { title: "Creating Your First Ticket", duration: "3:45", thumbnail: "ticket" },
              { title: "Setting Up User Roles", duration: "8:20", thumbnail: "roles" },
              { title: "Dashboard Walkthrough", duration: "6:15", thumbnail: "dashboard" },
              { title: "Mobile App Tutorial", duration: "4:50", thumbnail: "mobile" },
              { title: "API Integration Guide", duration: "12:30", thumbnail: "api" }
            ].map((video, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-white">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <PlayCircleIcon className="w-16 h-16 text-blue-600" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900">{video.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need Additional Help?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Contact Support
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              Community Forum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
