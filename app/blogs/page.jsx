"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Fuse from "fuse.js"
import { ArrowRight, Search, Filter, Calendar, User, X, ChevronDown, LoaderCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

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
  const [allBlogs, setAllBlogs] = useState([]) // Store all blogs for popular posts
  const [popularPosts, setPopularPosts] = useState([]) // Static popular posts
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.4 },        // Reduced from 0.6
      { name: 'excerpt', weight: 0.3 },      // Same
      { name: 'tags', weight: 0.2 },         // NEW: Add tags to search
      { name: 'author.name', weight: 0.1 }   // Same
    ],
    threshold: 0.6,
    includeScore: true,
    minMatchCharLength: 1,
    ignoreLocation: true,
    findAllMatches: true
  }

  // Initialize Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(blogs, fuseOptions)
  }, [blogs])

  // Fetch all blogs for static data (popular posts, categories)
  const fetchAllBlogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
        sortBy: 'newest'
      })

      const response = await fetch(`/api/admin/blogs?${params}`)
      const data = await response.json()

      if (data.success) {
        setAllBlogs(data.blogs)

        // Get popular posts based on views and likes (top 3) - static
        const sortedByPopularity = [...data.blogs].sort((a, b) => {
          const scoreA = (a.views || 0) + ((a.likeCount || 0) * 10)
          const scoreB = (b.views || 0) + ((b.likeCount || 0) * 10)
          return scoreB - scoreA
        })
        setPopularPosts(sortedByPopularity.slice(0, 3))

        // Extract unique categories from all blogs
        const uniqueCategories = [
          { id: "all", name: "All", count: data.blogs.length },
          ...data.blogs.reduce((acc, blog) => {
            const categoryName = blog.category // Keep original capitalization
            const existingCategory = acc.find(cat => cat.name === categoryName)
            if (existingCategory) {
              existingCategory.count++
            } else {
              acc.push({
                id: categoryName, // Use original name as ID too
                name: categoryName,
                count: 1
              })
            }
            return acc
          }, [])
        ]
        console.log('Generated categories:', uniqueCategories)
        setCategories(uniqueCategories)

        // Extract unique authors from all blogs
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
      }
    } catch (err) {
      console.error('Error fetching all blogs:', err)
    }
  }

  // Fetch filtered blogs for the main list
  const fetchBlogs = async () => {
    try {
      // Don't show loading spinner for filter changes, only for initial load
      if (blogs.length === 0) {
        setLoading(true)
      }
      setError(null)
      
      // Build API params - now including search term
      const params = new URLSearchParams({
        category: selectedCategory !== 'all' ? selectedCategory : '',
        sortBy: sortBy,
        limit: '100'
      })

      if (dateFilter !== 'all') {
        params.append('dateRange', dateFilter)
      }

      // Add search term to API call for server-side search
      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim())
      }

      console.log('API call params:', params.toString())
      console.log('Selected category:', selectedCategory)

      const response = await fetch(`/api/admin/blogs?${params}`)
      const data = await response.json()

      if (data.success) {
        setBlogs(data.blogs) // Only affects the main blog list
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

  // Debounced search to prevent too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load static data once on component mount
  useEffect(() => {
    fetchAllBlogs()
  }, [])

  // Fetch filtered blogs when filters change (including debounced search)
  useEffect(() => {
    fetchBlogs()
  }, [selectedCategory, selectedAuthor, dateFilter, sortBy, debouncedSearchTerm])

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

  // Apply additional client-side filters (server handles search)
  const filteredAndSortedPosts = useMemo(() => {
    let results = blogs

    // Apply additional filters
    results = results.filter((post) => {
      // Author filter (client-side for more precise matching)
      if (selectedAuthor !== "all") {
        const authorMatches = post.author?.name?.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "") === selectedAuthor
        if (!authorMatches) return false
      }

      return true
    })

    return results
  }, [blogs, selectedAuthor])

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
                placeholder="Search articles, tags, authors, or topics..."  
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
            Showing {filteredAndSortedPosts.length} of {allBlogs.length} articles
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Static Hero Section */}
            <div className="mb-8">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="relative h-96">
                  {/* Background image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/blogs_banner.png)' }}
                  />
                  {/* Enhanced overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 backdrop-blur-sm"/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-8">
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                        Japan Explorer: All About Japan
                      </h1>
                      <p className="text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
                        Discover comprehensive guides, tips, and insights about Japan - from language and culture to travel and traditions.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Blog Posts Grid */}
            {filteredAndSortedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {filteredAndSortedPosts.map((post) => (
                  <Link key={post._id} href={`/blogs/${post.slug}`}>
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        <img 
                          src={post.featuredImage || "/placeholder.svg"} 
                          alt={post.title} 
                          className="w-full h-48 object-cover object-center" 
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg items-center leading-tight hover:text-[#4a7c59] transition-colors line-clamp-2 min-h-[2.8rem]">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author?.icon || "/placeholder.svg"}
                              alt={post.author?.name || "Author"}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-sm text-gray-600">{post.author?.name || 'Unknown Author'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
              {popularPosts.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Popular Posts</h3>
                    <div className="space-y-4">
                      {popularPosts.map((post) => (
                        <div key={post._id} className="flex items-start gap-3">
                          <img
                            src={post.featuredImage || "/placeholder.svg"}
                            alt={post.title}
                            className="w-16 h-16 rounded-lg object-cover object-center flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 hover:text-[#4a7c59] transition-colors">
                              <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                            </h4>
                            <span className="text-xs text-gray-500">{post.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            console.log('Clicked category:', category.id, 'Current selected:', selectedCategory)
                            setSelectedCategory(category.id)
                            setShowFilters(false) // Close filters if open
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors text-sm hover:bg-gray-50 ${
                            selectedCategory === category.id
                              ? "bg-[#eef2eb] text-[#4a7c59] font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          <span>{category.name}</span>
                          <span className={`text-xs ${
                            selectedCategory === category.id ? "text-[#4a7c59]" : "text-gray-400"
                          }`}>
                            {category.count}
                          </span>
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