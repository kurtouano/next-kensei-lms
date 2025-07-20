"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, User, LoaderCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BlogPostPage({ params }) {
  const { data: session, status } = useSession()
  const [blogPost, setBlogPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [slug, setSlug] = useState(null)
  const [showLoginMessage, setShowLoginMessage] = useState(false)

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    resolveParams()
  }, [params])

  // Fetch blog post data
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the specific blog post
        const response = await fetch(`/api/blogs/${slug}`)
        const data = await response.json()

        if (data.success) {
          setBlogPost(data.blog)
          setRelatedPosts(data.relatedPosts || [])
          setLikes(data.blog.likeCount || 0)
          
          // Check if user has liked this post (only for authenticated users)
          if (session?.user?.id) {
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
            setIsLiked(likedPosts.includes(data.blog._id))
          }
        } else {
          setError(data.error || 'Blog post not found')
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBlogPost()
    }
  }, [slug, session])

  const handleLike = async () => {
    if (!blogPost) return

    // Check if user is authenticated
    if (!session?.user?.id) {
      setShowLoginMessage(true)
      setTimeout(() => setShowLoginMessage(false), 3000) // Hide message after 3 seconds
      return
    }

    try {
      const response = await fetch(`/api/blogs/${blogPost.slug}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        setIsLiked(result.isLiked)
        setLikes(result.likeCount)

        // Update localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
        if (result.isLiked) {
          likedPosts.push(blogPost._id)
        } else {
          const index = likedPosts.indexOf(blogPost._id)
          if (index > -1) likedPosts.splice(index, 1)
        }
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // For authenticated users, still allow optimistic update
      setIsLiked(!isLiked)
      setLikes(prev => isLiked ? prev - 1 : prev + 1)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blogPost.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading || status === "loading") {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-[#4a7c59]" />
                <p className="text-gray-600">Loading blog post...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !blogPost) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center py-16">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
              <p className="text-gray-600 mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
              <Link href="/blogs">
                <Button className="bg-[#4a7c59] hover:bg-[#3a6147]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blogs
                </Button>
              </Link>
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
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/blogs"
              className="inline-flex items-center text-[#4a7c59] hover:text-[#3a6147] transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Link>
          </div>

          {/* Login Message Toast */}
          {showLoginMessage && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
              <div className="text-center">
                <p className="font-medium text-gray-900 text-sm">Login Required</p>
                <p className="text-gray-600 text-sm mt-1">
                  Please <Link href="/auth/signin" className="text-[#4a7c59] hover:underline">log in</Link> to like this article.
                </p>
              </div>
            </div>
          )}

          {/* Article Header */}
          <div className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm font-medium">
                {blogPost.category}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">{blogPost.title}</h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(blogPost.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blogPost.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{blogPost.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-4">
              {/* Featured Image */}
              {blogPost.featuredImage && (
                <div className="mb-8">
                  <img
                    src={blogPost.featuredImage}
                    alt={blogPost.title}
                    className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Article Content */}
              <Card className="border-0 shadow-sm mb-8">
                <CardContent className="p-8">
                  <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#4a7c59] prose-strong:text-gray-900 rich-text-content"
                    dangerouslySetInnerHTML={{ __html: blogPost.content }}
                  />
                  
                  {/* Custom CSS for rich text editor content */}
                  <style jsx>{`
                    :global(.rich-text-content h1) {
                      font-size: 2em;
                      font-weight: 600;
                      margin: 0.67em 0;
                      line-height: 1.2;
                      color: #111827;
                    }
                    
                    :global(.rich-text-content h2) {
                      font-size: 1.5em;
                      font-weight: 600;
                      margin: 0.83em 0;
                      line-height: 1.3;
                      color: #111827;
                    }
                    
                    :global(.rich-text-content h3) {
                      font-size: 1.17em;
                      font-weight: 600;
                      margin: 1em 0;
                      line-height: 1.4;
                      color: #111827;
                    }
                    
                    :global(.rich-text-content .bullet-list) {
                      list-style-type: disc !important;
                      margin: 1em 0;
                      padding-left: 1.5em;
                    }
                    
                    :global(.rich-text-content .ordered-list) {
                      list-style-type: decimal !important;
                      margin: 1em 0;
                      padding-left: 1.5em;
                    }
                    
                    :global(.rich-text-content .list-item) {
                      margin: 0.5em 0;
                      line-height: 1.5;
                      display: list-item;
                    }
                    
                    :global(.rich-text-content .list-item p) {
                      margin: 0;
                      display: inline;
                    }
                    
                    :global(.rich-text-content .editor-image) {
                      max-width: 70%;
                      height: auto;
                      border-radius: 8px;
                      margin: 1.5em auto;
                      display: block;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }
                    
                    :global(.rich-text-content p) {
                      margin: 1em 0;
                      line-height: 1.7;
                      font-weight: normal;
                      color: #374151;
                    }
                    
                    :global(.rich-text-content p:first-child) {
                      margin-top: 0;
                    }
                    
                    :global(.rich-text-content p:last-child) {
                      margin-bottom: 0;
                    }

                    :global(.rich-text-content strong) {
                      font-weight: bold;
                      color: #111827;
                    }

                    :global(.rich-text-content em) {
                      font-style: italic;
                    }

                    /* Override default prose styles for our custom classes */
                    :global(.rich-text-content ul.bullet-list) {
                      list-style-type: disc !important;
                    }
                    
                    :global(.rich-text-content ol.ordered-list) {
                      list-style-type: decimal !important;
                    }
                    
                    :global(.rich-text-content li.list-item) {
                      margin: 0.5em 0 !important;
                      display: list-item !important;
                    }

                    /* Ensure proper spacing and formatting */
                    :global(.rich-text-content > *:first-child) {
                      margin-top: 0;
                    }
                    
                    :global(.rich-text-content > *:last-child) {
                      margin-bottom: 0;
                    }
                  `}</style>
                </CardContent>
              </Card>

              {/* Tags */}
              {blogPost.tags && blogPost.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.map((tag, index) => (
                      <Link 
                        key={index} 
                        href={`/blogs?search=${encodeURIComponent(tag)}`}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Actions */}
              <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm mb-8">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleLike}
                    className={`flex items-center gap-2 ${isLiked ? "text-red-500" : "text-gray-600"}`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likes}</span>
                  </Button>
                  <Button variant="ghost" onClick={handleShare} className="flex items-center gap-2 text-gray-600">
                    <Share2 className="h-5 w-5" />
                    Share
                  </Button>
                </div>
                <div className="text-sm text-gray-500">{blogPost.views.toLocaleString()} views</div>
              </div>

              {/* Author Card */}
              {blogPost.author && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={blogPost.author.icon || "/placeholder.svg"}
                        alt={blogPost.author.name}
                        className="w-20 h-20 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{blogPost.author.name}</h3>
                        <p className="text-[#4a7c59] font-medium mb-2">Blog Author</p>
                        <p className="text-gray-600 mb-4">
                          Author of {blogPost.title} and other insightful articles on Japanese learning.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
                      <div className="space-y-4">
                        {relatedPosts.map((post) => (
                          <Link key={post._id} href={`/blogs/${post.slug}`} className="block group">
                            <div className="flex gap-4">
                              <img
                                src={post.featuredImage || "/placeholder.svg"}
                                alt={post.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 group-hover:text-[#4a7c59] transition-colors leading-tight mb-2">
                                  {post.title}
                                </h4>
                                <p className="text-xs text-gray-500">{post.readTime}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Newsletter Signup */}
                <Card className="border-0 shadow-sm bg-gradient-to-br from-[#4a7c59] to-[#3a6147]">
                  <CardContent className="p-6 text-white">
                    <h3 className="font-semibold mb-2">Stay Updated</h3>
                    <p className="text-sm text-green-100 mb-4">Get the latest articles delivered to your inbox.</p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 rounded-md text-gray-900 text-sm focus:ring-2 focus:ring-white focus:outline-none"
                      />
                      <Button className="w-full bg-white text-[#4a7c59] hover:bg-gray-100">Subscribe</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}