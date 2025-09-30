import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  WrenchScrewdriverIcon,
  NewspaperIcon,
  CalendarDaysIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  RssIcon,
  ShareIcon
} from "@heroicons/react/24/outline"

const Blog = () => {
  const featuredPost = {
    id: 1,
    title: "Introducing AI-Powered Ticket Routing: 40% Faster Resolution Times",
    excerpt: "Our latest machine learning algorithms now automatically categorize and route support tickets to the right technicians, dramatically reducing response times and improving patient care outcomes.",
    content: "Healthcare IT teams are under constant pressure to resolve issues quickly while maintaining the highest standards of patient care...",
    author: "Dr. Emily Carter",
    authorRole: "Chief Technology Officer",
    publishedAt: "2024-12-10",
    readTime: "5 min read",
    category: "Product Updates",
    tags: ["AI", "Machine Learning", "Automation", "Performance"],
    image: "/api/placeholder/800/400"
  }

  const blogPosts = [
    {
      id: 2,
      title: "HIPAA Compliance in 2024: New Requirements and Best Practices",
      excerpt: "Stay ahead of evolving healthcare regulations with our comprehensive guide to HIPAA compliance requirements for IT management platforms.",
      author: "David Rodriguez",
      authorRole: "Security & Compliance Officer",
      publishedAt: "2024-12-08",
      readTime: "8 min read",
      category: "Compliance",
      tags: ["HIPAA", "Security", "Compliance", "Healthcare"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 3,
      title: "5 Ways to Optimize Your Healthcare IT Workflow",
      excerpt: "Learn practical strategies to streamline your IT operations, reduce technician workload, and improve service delivery across your healthcare organization.",
      author: "Sarah Kim",
      authorRole: "Product Manager & UX Lead",
      publishedAt: "2024-12-05",
      readTime: "6 min read",
      category: "Best Practices",
      tags: ["Workflow", "Optimization", "Productivity", "Healthcare IT"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 4,
      title: "Case Study: Regional Medical Center Reduces IT Costs by 35%",
      excerpt: "Discover how Regional Medical Center transformed their IT operations and achieved significant cost savings while improving patient care quality.",
      author: "Jennifer Walsh",
      authorRole: "Customer Success Manager",
      publishedAt: "2024-12-03",
      readTime: "7 min read",
      category: "Case Studies",
      tags: ["Case Study", "Cost Reduction", "ROI", "Healthcare"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 5,
      title: "The Future of Healthcare IT: Trends to Watch in 2025",
      excerpt: "Explore emerging technologies and trends that will shape healthcare IT management in the coming year, from AI automation to cloud-native solutions.",
      author: "Marcus Thompson",
      authorRole: "Lead Software Engineer",
      publishedAt: "2024-12-01",
      readTime: "9 min read",
      category: "Industry Insights",
      tags: ["Future Tech", "Trends", "Innovation", "Healthcare IT"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 6,
      title: "Mobile-First IT Support: Empowering Field Technicians",
      excerpt: "Learn how our mobile-optimized platform is revolutionizing field service management and enabling technicians to resolve issues faster than ever.",
      author: "Michael Chen",
      authorRole: "DevOps Engineer",
      publishedAt: "2024-11-28",
      readTime: "4 min read",
      category: "Product Updates",
      tags: ["Mobile", "Field Service", "Technicians", "Innovation"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 7,
      title: "Building Resilient Healthcare IT Infrastructure",
      excerpt: "Essential strategies for creating robust, scalable IT infrastructure that can handle the critical demands of modern healthcare environments.",
      author: "Dr. Emily Carter",
      authorRole: "Chief Technology Officer",
      publishedAt: "2024-11-25",
      readTime: "10 min read",
      category: "Technical",
      tags: ["Infrastructure", "Scalability", "Resilience", "Architecture"],
      image: "/api/placeholder/400/250"
    }
  ]

  const categories = [
    { name: "All Posts", count: 25, active: true },
    { name: "Product Updates", count: 8 },
    { name: "Best Practices", count: 6 },
    { name: "Case Studies", count: 4 },
    { name: "Industry Insights", count: 5 },
    { name: "Technical", count: 3 },
    { name: "Compliance", count: 2 }
  ]

  const recentPosts = [
    {
      title: "New Dashboard Analytics Features Released",
      publishedAt: "2024-12-12",
      category: "Product Updates"
    },
    {
      title: "Webinar: Advanced Reporting Techniques",
      publishedAt: "2024-12-11",
      category: "Events"
    },
    {
      title: "Security Update: Enhanced Encryption",
      publishedAt: "2024-12-09",
      category: "Security"
    }
  ]

  const getCategoryColor = (category) => {
    const colors = {
      "Product Updates": "bg-blue-100 text-blue-800",
      "Best Practices": "bg-green-100 text-green-800",
      "Case Studies": "bg-purple-100 text-purple-800",
      "Industry Insights": "bg-orange-100 text-orange-800",
      "Technical": "bg-gray-100 text-gray-800",
      "Compliance": "bg-red-100 text-red-800",
      "Events": "bg-yellow-100 text-yellow-800",
      "Security": "bg-indigo-100 text-indigo-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
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
              <NewspaperIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Blog & News
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Stay updated with the latest insights, best practices, and innovations in healthcare IT management. 
            Learn from industry experts and discover new ways to optimize your operations.
          </p>
        </div>
      </div>

      {/* Search and Subscribe */}
      <div className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <RssIcon className="w-4 h-4 mr-2" />
                Subscribe to RSS
              </Button>
              <Button size="sm">
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Post */}
              <Card className="mb-12 border border-gray-200 shadow-lg overflow-hidden">
                <div className="h-64 bg-gray-200"></div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(featuredPost.category)}`}>
                      {featuredPost.category}
                    </span>
                    <span className="text-sm text-gray-500">Featured</span>
                  </div>
                  <h2 className="text-3xl font-bold text-[#2F327D] mb-4">{featuredPost.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-sm text-gray-500">{featuredPost.readTime}</span>
                    </div>
                    <Button>
                      Read More
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Blog Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#2F327D] mb-3 line-clamp-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3 h-3" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="w-3 h-3" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button size="sm" variant="outline">
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button size="lg" variant="outline">
                  Load More Articles
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          category.active ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">({category.count})</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPosts.map((post, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stay Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Get the latest insights and updates delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <Button className="w-full" size="sm">
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    No spam. Unsubscribe anytime.
                  </p>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Healthcare IT", "HIPAA", "Automation", "Security", "Compliance", 
                      "Best Practices", "Innovation", "Mobile", "Analytics", "Workflow"
                    ].map((tag, index) => (
                      <button
                        key={index}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog
