"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Fuse from "fuse.js"
import { ArrowRight, Search, Filter, Calendar, User, X, ChevronDown, LoaderCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

const popularPosts = [
  { id: 6, title: "Networking Fundamentals for Beginners", image: "/placeholder.svg?height=60&width=60", category: "Technology" },
  { id: 7, title: "Web Dev for Busy Professionals", image: "/placeholder.svg?height=60&width=60", category: "Technology" },
  { id: 8, title: "Sustainable Living Tips for Modern Life", image: "/placeholder.svg?height=60&width=60", category: "Lifestyle" },
]

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAuthor, setSelectedAuthor] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  
  // API state
  const [blogs, setBlogs] = useState([])
  const [featuredPost, setFeaturedPost] = useState(null)
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.6 },
      { name: 'excerpt', weight: 0.3 },
      { name: 'author.name', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2
  }

  // Initialize Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(blogs, fuseOptions)
  }, [blogs])

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build API params (excluding search since we handle that client-side)
      const params = new URLSearchParams({
        category: selectedCategory !== 'all' ? selectedCategory : '',
        sortBy: sortBy,
        limit: '50'
      })

      if (dateFilter !== 'all') {
        params.append('dateRange', dateFilter)
      }

      const response = await fetch(`/api/admin/blogs?${params}`)
      const data = await response.json()

      if (data.success) {
        setBlogs(data.blogs)
        
        // Set featured post (most recent or most popular)
        if (data.blogs.length > 0) {
          setFeaturedPost(data.blogs[0])
        }

        // Extract unique categories from blogs
        const uniqueCategories = [
          { id: "all", name: "All", count: data.blogs.length },
          ...data.blogs.reduce((acc, blog) => {
            const existingCategory = acc.find(cat => cat.id === blog.category.toLowerCase().replace(/\s+/g, "-"))
            if (existingCategory) {
              existingCategory.count++
            } else {
              acc.push({
                id: blog.category.toLowerCase().replace(/\s+/g, "-"),
                name: blog.category,
                count: 1
              })
            }
            return acc
          }, [])
        ]
        setCategories(uniqueCategories)

        // Extract unique authors
        const uniqueAuthors = [
          { id: "all", name: "All Authors" },
          ...data.blogs.reduce((acc, blog) => {
            if (blog.author && blog.author.name) {
              const authorId = blog.author.name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "")
              const existingAuthor = acc.find(author => author.id === authorId)
              if (!existingAuthor) {
                acc.push({
                  id: authorId,
                  name: blog.author.name
                })
              }
            }
            return acc
          }, [])
        ]
        setAuthors(uniqueAuthors)

      } else {
        setError(data.error || 'Failed to fetch blogs')
      }
    } catch (err) {
      console.error('Error fetching blogs:', err)
      setError('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  // Fetch blogs when filters change (except search)
  useEffect(() => {
    fetchBlogs()
  }, [selectedCategory, selectedAuthor, dateFilter, sortBy])

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

  // Filter and search blogs using Fuse.js
  const filteredAndSortedPosts = useMemo(() => {
    let results = blogs

    // Apply search using Fuse.js if search term exists
    if (searchTerm.trim()) {
      const fuseResults = fuse.search(searchTerm.trim())
      results = fuseResults.map(result => result.item)
    }

    // Apply additional filters (author and date are handled server-side via category, but we can add client-side filtering for more complex scenarios)
    results = results.filter((post) => {
      // Author filter (client-side for more precise matching)
      if (selectedAuthor !== "all") {
        const authorMatches = post.author?.name?.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "") === selectedAuthor
        if (!authorMatches) return false
      }

      return true
    })

    return results
  }, [blogs, searchTerm, fuse, selectedAuthor])

  if (loading && blogs.length === 0) {
    return (
      <>
        <Header/>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-[#4a7c59]" />
                <p className="text-gray-600">Loading blogs...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">⚠️</div>
                <div>
                  <h4 className="font-medium text-red-800">Error loading blogs</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
          {(activeFiltersCount > 0 || searchTerm) && (
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
            Showing {filteredAndSortedPosts.length} of {blogs.length} articles
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-8">
                <Card className="overflow-hidden border-0 shadow-lg">
                  <div className="relative h-96 bg-gradient-to-r from-[#4a7c59] to-[#3a6147]">
                    <img
                      src={featuredPost.featuredImage || "/placeholder.svg"}
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
                          src={featuredPost.author?.icon || "/placeholder.svg"}
                          alt={featuredPost.author?.name || "Author"}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold">{featuredPost.author?.name || 'Unknown Author'}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span>{new Date(featuredPost.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{featuredPost.readTime}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/blogs/${featuredPost.slug}`}>
                        <Button className="bg-white text-[#4a7c59] hover:bg-gray-100">
                          Read Article
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Blog Posts Grid */}
            {filteredAndSortedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {filteredAndSortedPosts.slice(featuredPost ? 1 : 0).map((post) => (
                  <Card key={post._id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img src={post.featuredImage || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
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
                            src={post.author?.icon || "/placeholder.svg"}
                            alt={post.author?.name || "Author"}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{post.author?.name || 'Unknown Author'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                  {searchTerm 
                    ? `No posts match your search for "${searchTerm}". Try a different search term.`
                    : "Try adjusting your search or filter criteria to find what you're looking for."
                  }
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
            {filteredAndSortedPosts.length > 6 && (
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                    />
                    <Button className="w-full bg-[#4a7c59] hover:bg-[#3a6147] text-white">Subscribe</Button>
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
                          <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 hover:text-[#4a7c59] transition-colors">
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
              {categories.length > 0 && (
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
                              ? "bg-[#eef2eb] text-[#4a7c59]"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}