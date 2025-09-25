"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Fuse from "fuse.js"
import { Plus, Search, Edit, Trash2, Eye, LoaderCircle, RefreshCcw, ChevronDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AdminBlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [blogs, setBlogs] = useState([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    published: 0,
    drafts: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePages, setHasMorePages] = useState(false)
  const [totalBlogs, setTotalBlogs] = useState(0)
  const BLOGS_PER_PAGE = 10

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'excerpt', weight: 0.3 },
      { name: 'author.name', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
  }

  // Initialize Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(blogs, fuseOptions)
  }, [blogs])

  // Fetch blogs from API
  const fetchBlogs = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true)
        setCurrentPage(1)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      const params = new URLSearchParams({
        category: categoryFilter !== 'all' ? categoryFilter : '',
        sortBy: sortBy,
        page: page.toString(),
        limit: BLOGS_PER_PAGE.toString()
      })

      const response = await fetch(`/api/admin/blogs?${params}`)
      const data = await response.json()

      if (data.success) {
        if (append && page > 1) {
          // Append new blogs to existing list
          setBlogs(prevBlogs => [...prevBlogs, ...data.blogs])
        } else {
          // Replace blogs list (first load or filter change)
          setBlogs(data.blogs)
        }
        
        // Update pagination info
        setCurrentPage(page)
        setHasMorePages(data.pagination.hasNextPage)
        setTotalBlogs(data.pagination.totalBlogs)
        
        // Calculate stats from total data (not just current page)
        if (page === 1) {
          setStats({
            totalPosts: data.pagination.totalBlogs,
            published: data.pagination.totalBlogs,
            drafts: 0,
            totalViews: data.blogs.reduce((sum, blog) => sum + blog.views, 0)
          })
        }
      } else {
        setError(data.error || 'Failed to fetch blogs')
      }
    } catch (err) {
      console.error('Error fetching blogs:', err)
      setError('Failed to fetch blogs')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more blogs
  const handleLoadMore = () => {
    if (!loadingMore && hasMorePages) {
      fetchBlogs(currentPage + 1, true)
    }
  }

  // Reset and fetch blogs when filters change
  useEffect(() => {
    setBlogs([]) // Clear existing blogs
    fetchBlogs(1, false) // Fetch first page
  }, [categoryFilter, sortBy])

  // Initial load
  useEffect(() => {
    fetchBlogs(1, false)
  }, [])

  // Handle blog deletion
  const handleDelete = async (blogId, blogTitle) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Blog deleted successfully!')
        // Remove deleted blog from current list
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId))
        setTotalBlogs(prev => prev - 1)
        setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1, published: prev.published - 1 }))
      } else {
        alert(result.error || 'Failed to delete blog')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    }
  }

  // Filter and search blogs using Fuse.js (client-side for loaded blogs)
  const filteredBlogs = useMemo(() => {
    let results = blogs

    // Apply search using Fuse.js if search term exists
    if (searchTerm.trim()) {
      const fuseResults = fuse.search(searchTerm.trim())
      results = fuseResults.map(result => result.item)
    }

    return results
  }, [blogs, searchTerm, fuse])

  // Reset search when filters change
  useEffect(() => {
    setSearchTerm("")
  }, [categoryFilter, sortBy])

  if (loading && blogs.length === 0) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-[#4a7c59]" />
              <p className="text-gray-600">Loading blogs...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e2d]">Blog Management</h1>
            <p className="text-sm sm:text-base text-[#4a7c59]">Create and manage your blog posts</p>
          </div>
          <div className="flex justify-end">
            <Link href="/admin/blogs/create">
              <Button className="bg-[#4a7c59] hover:bg-[#3a6147] text-sm w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> New Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{new Set(blogs.map(b => b.category)).size}</div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search posts by title, excerpt, or author..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Grammar">Grammar</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Culture">Culture</option>
                <option value="Travel">Travel</option>
                <option value="Business">Business</option>
                <option value="Food">Food</option>
                <option value="Entertainment">Entertainment</option>
              </select>
              <select
                className="flex-1 sm:max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Blog Posts ({filteredBlogs.length}{searchTerm && ` filtered`} of {totalBlogs} total)
            {searchTerm && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                • Searching for "{searchTerm}"
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Manage your blog posts and their content
            {!searchTerm && hasMorePages && (
              <span className="ml-2 text-[#4a7c59]">• Showing {blogs.length} of {totalBlogs} posts</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No matching posts found' : 'No blog posts found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No posts match your search for "${searchTerm}". Try a different search term.`
                  : blogs.length === 0 
                    ? 'Get started by creating your first blog post!' 
                    : 'Try adjusting your filter criteria.'
                }
              </p>
              {!searchTerm && blogs.length === 0 && (
                <Link href="/admin/blogs/create">
                  <Button className="bg-[#4a7c59] hover:bg-[#3a6147]">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Post
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-medium">Title</th>
                      <th className="pb-3 text-left font-medium">Author</th>
                      <th className="pb-3 text-left font-medium">Category</th>
                      <th className="pb-3 text-left font-medium">Read Time</th>
                      <th className="pb-3 text-left font-medium">Published</th>
                      <th className="pb-3 text-left font-medium">Views</th>
                      <th className="pb-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((blog) => (
                      <tr key={blog._id} className="border-b hover:bg-gray-50">
                        <td className="py-4">
                          <div className="max-w-xs">
                            <div className="font-medium text-[#2c3e2d] truncate">{blog.title}</div>
                            <div className="text-sm text-gray-500 truncate">{blog.excerpt}</div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">
                          {blog.author?.name || 'Unknown Author'}
                        </td>
                        <td className="py-4">
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-[#eef2eb] text-[#4a7c59]">
                            {blog.category}
                          </span>
                        </td>
                        <td className="py-4 text-gray-600 text-sm">
                          {blog.readTime}
                        </td>
                        <td className="py-4 text-gray-600 text-sm">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-gray-600">
                          {blog.views.toLocaleString()}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/blogs/${blog.slug}`} target="_blank">
                              <Button variant="ghost" size="sm" title="View Post">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/blogs/edit/${blog._id}`}>
                              <Button variant="ghost" size="sm" title="Edit Post">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              title="Delete Post"
                              onClick={() => handleDelete(blog._id, blog.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredBlogs.map((blog) => (
                  <div key={blog._id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#2c3e2d] text-sm sm:text-base truncate">{blog.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Link href={`/blogs/${blog.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" title="View Post" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/blogs/edit/${blog._id}`}>
                          <Button variant="ghost" size="sm" title="Edit Post" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete Post"
                          onClick={() => handleDelete(blog._id, blog.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-3">
                      <span className="font-medium">{blog.author?.name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                      <span>•</span>
                      <span>{blog.views.toLocaleString()} views</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-[#eef2eb] text-[#4a7c59]">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {!searchTerm && hasMorePages && (
                <div className="mt-4 sm:mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] text-sm w-full sm:w-auto"
                  >
                    {loadingMore ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Load More Posts ({totalBlogs - blogs.length} remaining)</span>
                        <span className="sm:hidden">Load More ({totalBlogs - blogs.length})</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              {!searchTerm && !hasMorePages && blogs.length < totalBlogs && (
                <div className="mt-6 text-center text-sm text-gray-500">
                  Showing all {blogs.length} loaded posts of {totalBlogs} total
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  )
}