"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Search, Filter, Calendar, User, X, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

// Mock data - replace with actual API calls
const featuredPost = {
  id: 1,
  title: "The Future of Japanese Learning: AI-Powered Language Education",
  excerpt: "Explore how technology and AI are revolutionizing the way we learn Japanese, from personalized study plans to real-time pronunciation feedback.",
  author: "Dr. Hiroshi Tanaka",
  authorImage: "/placeholder.svg?height=40&width=40",
  publishedAt: "2024-01-15",
  readTime: "8 min read",
  category: "Technology",
  image: "/placeholder.svg?height=400&width=800",
  slug: "future-japanese-learning-ai",
}

const blogPosts = [
  {
    id: 2,
    title: "Building a Successful Japanese Study Culture",
    excerpt: "Learn the key principles that drive successful Japanese learning cultures and how to implement them in your organization.",
    author: "Yuki Sato",
    authorImage: "/placeholder.svg?height=32&width=32",
    publishedAt: "2024-01-12",
    readTime: "5 min read",
    category: "Business",
    image: "/placeholder.svg?height=200&width=300",
    slug: "building-successful-study-culture",
  },
  {
    id: 3,
    title: "Digital Marketing Trends for 2024",
    excerpt: "Discover the latest digital marketing trends that are shaping brands in today's competitive landscape.",
    author: "Mike Rodriguez",
    authorImage: "/placeholder.svg?height=32&width=32",
    publishedAt: "2024-01-10",
    readTime: "7 min read",
    category: "Marketing",
    image: "/placeholder.svg?height=200&width=300",
    slug: "digital-marketing-trends-2024",
  },
  {
    id: 4,
    title: "AI and the Future of Work",
    excerpt: "How artificial intelligence is reshaping industries and what it means for the future of employment.",
    author: "David Kim",
    authorImage: "/placeholder.svg?height=32&width=32",
    publishedAt: "2024-01-08",
    readTime: "6 min read",
    category: "AI & Tech",
    image: "/placeholder.svg?height=200&width=300",
    slug: "ai-future-of-work",
  },
  {
    id: 5,
    title: "The Art of Mindful Living",
    excerpt: "Practical tips for incorporating mindfulness into your daily routine for better mental health and productivity.",
    author: "Emma Wilson",
    authorImage: "/placeholder.svg?height=32&width=32",
    publishedAt: "2024-01-05",
    readTime: "4 min read",
    category: "Lifestyle",
    image: "/placeholder.svg?height=200&width=300",
    slug: "art-of-mindful-living",
  },
  {
    id: 6,
    title: "Advanced Japanese Grammar Patterns",
    excerpt: "Master complex Japanese grammar structures with practical examples and cultural context.",
    author: "Dr. Hiroshi Tanaka",
    authorImage: "/placeholder.svg?height=32&width=32",
    publishedAt: "2024-01-03",
    readTime: "12 min read",
    category: "Language Learning",
    image: "/placeholder.svg?height=200&width=300",
    slug: "advanced-japanese-grammar",
  },
  {
    id: 7,
    title: "Understanding Japanese Business Etiquette",
    excerpt: "Navigate the complex world of Japanese business culture with confidence and respect.",
    author: "Kenji Nakamura",
    authorImage: "/placeholder.svg?height=32&width=32",
    publishedAt: "2023-12-28",
    readTime: "9 min read",
    category: "Culture",
    image: "/placeholder.svg?height=200&width=300",
    slug: "japanese-business-etiquette",
  },
]

const popularPosts = [
  { id: 6, title: "Networking Fundamentals for Beginners", image: "/placeholder.svg?height=60&width=60", category: "Technology" },
  { id: 7, title: "Web Dev for Busy Professionals", image: "/placeholder.svg?height=60&width=60", category: "Technology" },
  { id: 8, title: "Sustainable Living Tips for Modern Life", image: "/placeholder.svg?height=60&width=60", category: "Lifestyle" },
]

const categories = [
  { id: "all", name: "All", count: 47 },
  { id: "technology", name: "Technology", count: 12 },
  { id: "business", name: "Business", count: 8 },
  { id: "lifestyle", name: "Lifestyle", count: 15 },
  { id: "marketing", name: "Marketing", count: 6 },
  { id: "ai-tech", name: "AI & Tech", count: 6 },
  { id: "language-learning", name: "Language Learning", count: 8 },
  { id: "culture", name: "Culture", count: 5 },
]

const authors = [
  { id: "all", name: "All Authors" },
  { id: "dr-hiroshi-tanaka", name: "Dr. Hiroshi Tanaka" },
  { id: "yuki-sato", name: "Yuki Sato" },
  { id: "mike-rodriguez", name: "Mike Rodriguez" },
  { id: "david-kim", name: "David Kim" },
  { id: "emma-wilson", name: "Emma Wilson" },
  { id: "kenji-nakamura", name: "Kenji Nakamura" },
]

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAuthor, setSelectedAuthor] = useState("all")
  const [dateFilter, setDateFilter] = useState("all") // all, last-month, last-3-months, last-year
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, popular
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Calculate active filters count
  useEffect(() => {
    let count = 0
    if (selectedCategory !== "all") count++
    if (selectedAuthor !== "all") count++
    if (dateFilter !== "all") count++
    if (sortBy !== "newest") count++
    setActiveFiltersCount(count)
  }, [selectedCategory, selectedAuthor, dateFilter, sortBy])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedAuthor("all")
    setDateFilter("all")
    setSortBy("newest")
  }

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = blogPosts.filter((post) => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = selectedCategory === "all" ||
        post.category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "") === selectedCategory

      // Author filter
      const matchesAuthor = selectedAuthor === "all" ||
        post.author.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "") === selectedAuthor

      // Date filter
      const postDate = new Date(post.publishedAt)
      const now = new Date()
      let matchesDate = true

      if (dateFilter === "last-month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        matchesDate = postDate >= lastMonth
      } else if (dateFilter === "last-3-months") {
        const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        matchesDate = postDate >= last3Months
      } else if (dateFilter === "last-year") {
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        matchesDate = postDate >= lastYear
      }

      return matchesSearch && matchesCategory && matchesAuthor && matchesDate
    })

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.publishedAt) - new Date(b.publishedAt)
        case "popular":
          // Mock popularity based on id (lower id = more popular)
          return a.id - b.id
        case "newest":
        default:
          return new Date(b.publishedAt) - new Date(a.publishedAt)
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, selectedAuthor, dateFilter, sortBy])

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles, authors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-[#4a7c59] text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Author Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                    <select
                      value={selectedAuthor}
                      onChange={(e) => setSelectedAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                    >
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="last-month">Last Month</option>
                      <option value="last-3-months">Last 3 Months</option>
                      <option value="last-year">Last Year</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      onClick={clearAllFilters}
                      className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-[#3a6147]">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory("all")} className="hover:text-[#3a6147]">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedAuthor !== "all" && (
                <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                  {authors.find(a => a.id === selectedAuthor)?.name}
                  <button onClick={() => setSelectedAuthor("all")} className="hover:text-[#3a6147]">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                  {dateFilter === "last-month" ? "Last Month" :
                   dateFilter === "last-3-months" ? "Last 3 Months" :
                   dateFilter === "last-year" ? "Last Year" : dateFilter}
                  <button onClick={() => setDateFilter("all")} className="hover:text-[#3a6147]">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-6">
            Showing {filteredAndSortedPosts.length} of {blogPosts.length} articles
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            <div className="mb-8">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="relative h-96 bg-gradient-to-r from-[#4a7c59] to-[#3a6147]">
                  <img
                    src={featuredPost.image || "/placeholder.svg"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="mb-4">
                      <span className="inline-block bg-[#4a7c59] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {featuredPost.category}
                      </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{featuredPost.title}</h1>
                    <p className="text-lg mb-6 text-gray-200 max-w-2xl">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={featuredPost.authorImage || "/placeholder.svg"}
                        alt={featuredPost.author}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{featuredPost.author}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Blog Posts Grid */}
            {filteredAndSortedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {filteredAndSortedPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight hover:text-[#4a7c59] transition-colors">
                        <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorImage || "/placeholder.svg"}
                            alt={post.author}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Load More Button */}
            {filteredAndSortedPosts.length > 0 && (
              <div className="text-center">
                <Button className="bg-[#4a7c59] hover:bg-[#3a6147] text-white px-8 py-3">
                  Load More Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Stay Updated */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Stay Updated</h3>
                  <p className="text-sm text-gray-600 mb-4">Get the latest blogs delivered to your inbox.</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                    <Button className="w-full bg-[#4a7c59] hover:bg-green-700 text-white">Subscribe</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Posts */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Popular Posts</h3>
                  <div className="space-y-4">
                    {popularPosts.map((post) => (
                      <div key={post.id} className="flex items-start gap-3">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 hover:text-green-600 transition-colors">
                            <Link href={`/blogs/${post.id}`}>{post.title}</Link>
                          </h4>
                          <span className="text-xs text-gray-500">{post.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors text-sm ${
                          selectedCategory === category.id
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs">{category.count}</span>
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
  </>
  )
}