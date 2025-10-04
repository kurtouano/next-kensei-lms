"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import Fuse from "fuse.js"
import { ArrowLeft, Search, X, Star, TrendingUp, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { SearchBarSkeleton, BlogGridSkeleton } from "@/components/BlogSkeleton"

export default function RecentArticlesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  
  // API state
  const [allBlogs, setAllBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimeoutRef = useRef(null)
  
  // Pagination state
  const [displayedBlogs, setDisplayedBlogs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreBlogs, setHasMoreBlogs] = useState(false)
  const blogsPerPage = 12 // Show 12 articles per page
  
  // Search input ref to maintain focus
  const searchInputRef = useRef(null)
  
  // Helper function to render author avatar
  const renderAuthorAvatar = (author) => {
    if (!author) return null
    
    if (author.icon === 'bonsai') {
      return (
        <div className="w-6 h-6 rounded-full border border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden">
          <BonsaiSVG 
            level={author.bonsai?.level || 1}
            treeColor={author.bonsai?.customization?.foliageColor || '#77DD82'} 
            potColor={author.bonsai?.customization?.potColor || '#FD9475'} 
            selectedEyes={author.bonsai?.customization?.eyes || 'default_eyes'}
            selectedMouth={author.bonsai?.customization?.mouth || 'default_mouth'}
            selectedPotStyle={author.bonsai?.customization?.potStyle || 'default_pot'}
            selectedGroundStyle={author.bonsai?.customization?.groundStyle || 'default_ground'}
            selectedHat={author.bonsai?.customization?.hat || null}
            selectedBackground={author.bonsai?.customization?.background || null}
            zoomed={true}
          />
        </div>
      )
    } else if (author.icon && author.icon.startsWith('http')) {
      return (
        <img
          src={author.icon}
          alt={author.name || "Author"}
          className="w-6 h-6 rounded-full object-cover"
        />
      )
    } else {
      return (
        <div className="w-6 h-6 rounded-full border border-[#4a7c59] bg-gray-200 flex items-center justify-center">
          <User className="h-3 w-3 text-gray-500" />
        </div>
      )
    }
  }

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
      
      // Reset retry count for new fetch attempts
      setRetryCount(0)
      
      const params = new URLSearchParams({
        limit: '100',
        sortBy: 'newest'
      })

      const response = await fetch(`/api/blogs?${params}`)
      
      // Handle HTTP errors (like 500 from database connection issues)
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("Database connection failed. Please wait while we reconnect...")
        } else if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        } else {
          throw new Error(`Server error (${response.status}). Please try again.`)
        }
      }
      
      const data = await response.json()

      if (data.success) {
        // Reset retry count on successful fetch
        setRetryCount(0)
        
        // Filter only recent blogs (non-featured)
        const recentBlogs = data.blogs.filter(blog => !blog.isFeatured)
        setAllBlogs(recentBlogs)

        // Extract unique categories from recent blogs
        const uniqueCategories = [
          { id: "all", name: "All Categories", count: recentBlogs.length },
          ...recentBlogs.reduce((acc, blog) => {
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
        setError(data.error || 'Failed to fetch recent blogs')
      }
    } catch (err) {
      console.error('Error fetching recent blogs:', err)
      
      // Auto-retry for database connection failures
      if (err.message.includes("Database connection failed") && retryCount < 3) {
        console.log(`Retrying blogs fetch (attempt ${retryCount + 1}/3)...`)
        setRetryCount(prev => prev + 1)
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        
        // Clear any existing timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchAllBlogs()
        }, delay)
        return
      }
      
      setError(err.message || 'Failed to fetch recent blogs')
    } finally {
      setLoading(false)
    }
  }

  // Load data once on component mount
  useEffect(() => {
    fetchAllBlogs()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
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

  // Update displayed blogs and pagination when filters change
  useEffect(() => {
    // Reset to first page
    setCurrentPage(1)
    
    // Show first batch of articles
    const firstBatch = filteredBlogs.slice(0, blogsPerPage)
    setDisplayedBlogs(firstBatch)
    
    // Check if there are more articles to load
    const hasMore = filteredBlogs.length > blogsPerPage
    setHasMoreBlogs(hasMore)
  }, [filteredBlogs, blogsPerPage])

  // Load more articles function
  const loadMoreArticles = () => {
    const nextPage = currentPage + 1
    const startIndex = currentPage * blogsPerPage
    const endIndex = Math.min(startIndex + blogsPerPage, filteredBlogs.length)
    
    const newArticles = filteredBlogs.slice(startIndex, endIndex)
    setDisplayedBlogs(prev => [...prev, ...newArticles])
    setCurrentPage(nextPage)
    setHasMoreBlogs(endIndex < filteredBlogs.length)
  }

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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Page Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <SearchBarSkeleton />
          <BlogGridSkeleton count={12} />
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blogs">
            <Button variant="ghost" className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Articles
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-[#4a7c59]" />
            <h1 className="text-4xl font-bold text-gray-900">Recent Articles</h1>
          </div>
          <p className="text-lg text-gray-600">
            Stay up to date with our latest articles about Japanese culture, language, and more.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">⚠️</div>
                <div>
                  <h4 className="font-medium text-red-800">Error loading recent articles</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Sort Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search recent articles..."  
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
            Showing {displayedBlogs.length} of {filteredBlogs.length} recent articles
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
            {selectedCategory !== "all" && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          </div>
        </div>

        {/* Recent Articles Grid */}
        {displayedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedBlogs.map((post) => (
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
                        {renderAuthorAvatar(post.author)}
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
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recent articles found</h3>
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
        {hasMoreBlogs && (
          <div className="text-center">
            <Button 
              onClick={loadMoreArticles}
              className="bg-[#4a7c59] hover:bg-[#3a6147] text-white px-8 py-3"
            >
              Load More Recent Articles
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  </>
  )
}
