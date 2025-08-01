"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import Fuse from "fuse.js"
import { ArrowRight, Search, X, LoaderCircle, Star, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  
  // API state
  const [allBlogs, setAllBlogs] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search input ref to maintain focus
  const searchInputRef = useRef(null)

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'excerpt', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
      { name: 'author.name', weight: 0.1 }
    ],
    threshold: 0.6,
    includeScore: true,
    minMatchCharLength: 1,
    ignoreLocation: true,
    findAllMatches: true
  }

  // Initialize Fuse instance with all blogs
  const fuse = useMemo(() => {
    return new Fuse(allBlogs, fuseOptions)
  }, [allBlogs])

  // Debounced search to prevent too many re-renders
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch all blogs once on component mount
  const fetchAllBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: '100',
        sortBy: 'newest'
      })

      const response = await fetch(`/api/blogs?${params}`)
      const data = await response.json()

      if (data.success) {
        setAllBlogs(data.blogs)

        // Get popular posts based on views and likes (top 3)
        const sortedByPopularity = [...data.blogs].sort((a, b) => {
          const scoreA = (a.views || 0) + ((a.likeCount || 0) * 10)
          const scoreB = (b.views || 0) + ((b.likeCount || 0) * 10)
          return scoreB - scoreA
        })
        setPopularPosts(sortedByPopularity.slice(0, 3))

        // Extract unique categories from all blogs
        const uniqueCategories = [
          { id: "all", name: "All Categories", count: data.blogs.length },
          ...data.blogs.reduce((acc, blog) => {
            const categoryName = blog.category
            const existingCategory = acc.find(cat => cat.name === categoryName)
            if (existingCategory) {
              existingCategory.count++
            } else {
              acc.push({
                id: categoryName,
                name: categoryName,
                count: 1
              })
            }
            return acc
          }, [])
        ]
        setCategories(uniqueCategories)
      } else {
        setError(data.error || 'Failed to fetch blogs')
      }
    } catch (err) {
      console.error('Error fetching all blogs:', err)
      setError('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  // Load data once on component mount
  useEffect(() => {
    fetchAllBlogs()
  }, [])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSortBy("newest")
  }

  // Filter and sort all blogs based on current filters
  const filteredBlogs = useMemo(() => {
    let results = allBlogs

    // Apply search filter using Fuse.js if search term exists
    if (debouncedSearchTerm.trim()) {
      const searchResults = fuse.search(debouncedSearchTerm.trim())
      results = searchResults.map(result => result.item)
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      results = results.filter(blog => blog.category === selectedCategory)
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'popular':
          const scoreA = (a.views || 0) + ((a.likeCount || 0) * 10)
          const scoreB = (b.views || 0) + ((b.likeCount || 0) * 10)
          return scoreB - scoreA
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    return results
  }, [allBlogs, debouncedSearchTerm, selectedCategory, sortBy, fuse])

  // Separate filtered blogs into featured and recent
  const { featuredBlogs, recentBlogs } = useMemo(() => {
    const featured = filteredBlogs.filter(blog => blog.isFeatured).slice(0, 3)
    const recent = filteredBlogs.filter(blog => !blog.isFeatured).slice(0, 6)
    
    return {
      featuredBlogs: featured,
      recentBlogs: recent
    }
  }, [filteredBlogs])

  // Handle search input change with focus preservation
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Preserve focus after state update
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 0)
  }

  // Check if any filters are active
  const hasActiveFilters = debouncedSearchTerm.trim() || selectedCategory !== "all" || sortBy !== "newest"

  if (loading) {
    return (
      <>
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

        {/* Simple Search and Sort Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search articles, tags, authors, or topics..."  
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    if (searchInputRef.current) {
                      searchInputRef.current.focus()
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {debouncedSearchTerm && (
                <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                  Search: "{debouncedSearchTerm}"
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
              
              {sortBy !== "newest" && (
                <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                  Sort: {sortBy === "oldest" ? "Oldest First" : "Most Popular"}
                  <button onClick={() => setSortBy("newest")} className="hover:text-[#3a6147]">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb] text-sm h-auto py-1"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-6">
            Showing {filteredBlogs.length} articles
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
            {selectedCategory !== "all" && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Static Hero Section */}
            <div className="mb-8">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="relative h-96">
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/blogs_banner.png)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/50 to-black/60 backdrop-blur-sm"/>
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

            {/* Featured Articles Section */}
            {featuredBlogs.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-6 w-6 text-[#4a7c59]" />
                  <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {featuredBlogs.map((post) => (
                    <Link key={post._id} href={`/blogs/${post.slug}`}>
                      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <div className="relative">
                          <img 
                            src={post.featuredImage || "/placeholder.svg"} 
                            alt={post.title} 
                            className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute top-3 right-3">
                            <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              {post.category}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight group-hover:text-[#4a7c59] transition-colors line-clamp-2 min-h-[2.8rem]">
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
              </div>
            )}

            {/* Recent Articles Section */}
            {recentBlogs.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-6 w-6 text-[#4a7c59]" />
                  <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {recentBlogs.map((post) => (
                    <Link key={post._id} href={`/blogs/${post.slug}`}>
                      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="relative">
                          <img 
                            src={post.featuredImage || "/placeholder.svg"} 
                            alt={post.title} 
                            className="w-full h-48 object-cover object-center" 
                          />
                          <div className="absolute top-3 right-3">
                            <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              {post.category}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight hover:text-[#4a7c59] transition-colors line-clamp-2 min-h-[2.8rem]">
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
              </div>
            )}

            {/* No Results Message */}
            {filteredBlogs.length === 0 && !loading && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or category to find what you're looking for.
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
            {filteredBlogs.length > 0 && (
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
            <div className="top-[70px] space-y-6">
              {/* Newsletter Signup */}
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

              {/* Quick Category Filter */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Browse by Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
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

            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}