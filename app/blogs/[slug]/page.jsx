"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, BookOpen, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function BlogPostPage({ params }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(42)

  // Mock blog post data - in real app, fetch based on params.slug
  const blogPost = {
    id: 1,
    title: "The Future of Japanese Learning: AI-Powered Language Education",
    content: `
      <p>The landscape of language learning is rapidly evolving, and Japanese education is at the forefront of this transformation. With the integration of artificial intelligence and advanced technology, students now have access to personalized, interactive, and highly effective learning experiences that were unimaginable just a few years ago.</p>

      <h2>The Traditional Challenges</h2>
      <p>Learning Japanese has always presented unique challenges for non-native speakers. The complex writing system, combining hiragana, katakana, and kanji, along with intricate grammar structures and cultural nuances, has made Japanese one of the most difficult languages for English speakers to master.</p>

      <p>Traditional classroom methods, while valuable, often struggle to provide the individualized attention and practice opportunities that each student needs. This is where AI-powered solutions are making a significant impact.</p>

      <h2>AI-Powered Personalization</h2>
      <p>Modern AI systems can analyze a student's learning patterns, identify strengths and weaknesses, and adapt the curriculum in real-time. This means that if a student struggles with kanji recognition, the system will provide additional practice exercises and alternative learning methods until mastery is achieved.</p>

      <blockquote>
        "The beauty of AI in language learning lies in its ability to provide infinite patience and personalized feedback, something that's often challenging in traditional classroom settings." - Dr. Hiroshi Tanaka, Language Learning Researcher
      </blockquote>

      <h2>Interactive Learning Experiences</h2>
      <p>Virtual reality and augmented reality technologies are creating immersive environments where students can practice Japanese in realistic scenarios. Imagine ordering food at a virtual Tokyo restaurant or navigating through Shibuya crossing while practicing directional vocabulary.</p>

      <h2>Real-Time Pronunciation Feedback</h2>
      <p>Advanced speech recognition technology can now provide instant feedback on pronunciation, helping students perfect their accent and intonation. This technology analyzes speech patterns and provides specific guidance on how to improve.</p>

      <h2>The Future Outlook</h2>
      <p>As we look toward the future, we can expect even more sophisticated AI tutors that can engage in natural conversations, provide cultural context, and adapt to individual learning styles. The combination of human instruction and AI assistance promises to make Japanese learning more accessible and effective than ever before.</p>

      <p>The journey to fluency in Japanese is no longer a solitary struggle. With AI as a learning companion, students can embark on this adventure with confidence, knowing they have a patient, knowledgeable, and always-available tutor by their side.</p>
    `,
    author: {
      name: "Dr. Hiroshi Tanaka",
      title: "Language Learning Researcher",
      image: "/placeholder.svg?height=60&width=60",
      bio: "Dr. Tanaka is a leading researcher in AI-powered language education with over 15 years of experience in Japanese pedagogy.",
    },
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    category: "Technology",
    tags: ["AI", "Language Learning", "Japanese", "Education Technology"],
    image: "/placeholder.svg?height=400&width=800",
    views: 1250,
    likes: 42,
    slug: "future-japanese-learning-ai",
  }

  // Mock related posts
  const relatedPosts = [
    {
      id: 2,
      title: "5 Essential Japanese Phrases for Travelers",
      image: "/placeholder.svg?height=100&width=150",
      slug: "essential-japanese-phrases-travelers",
      readTime: "5 min read",
    },
    {
      id: 3,
      title: "Understanding Japanese Honorifics",
      image: "/placeholder.svg?height=100&width=150",
      slug: "understanding-japanese-honorifics",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "The Art of Japanese Tea Ceremony",
      image: "/placeholder.svg?height=100&width=150",
      slug: "art-japanese-tea-ceremony",
      readTime: "7 min read",
    },
  ]

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
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

  return (
    <>
    <Header/>
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
                  {new Date(blogPost.publishedAt).toLocaleDateString("en-US", {
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

            {/* Author Info */}
            <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm mb-8">
              <img
                src={blogPost.author.image || "/placeholder.svg"}
                alt={blogPost.author.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{blogPost.author.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{blogPost.author.title}</p>
                <p className="text-sm text-gray-500">{blogPost.author.bio}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-4">
              {/* Featured Image */}
              <div className="mb-8">
                <img
                  src={blogPost.image || "/placeholder.svg"}
                  alt={blogPost.title}
                  className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Article Content */}
              <Card className="border-0 shadow-sm mb-8">
                <CardContent className="p-8">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: blogPost.content }}
                    style={{
                      lineHeight: "1.8",
                      fontSize: "1.1rem",
                    }}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blogPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

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
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={blogPost.author.image || "/placeholder.svg"}
                      alt={blogPost.author.name}
                      className="w-20 h-20 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{blogPost.author.name}</h3>
                      <p className="text-[#4a7c59] font-medium mb-2">{blogPost.author.title}</p>
                      <p className="text-gray-600 mb-4">{blogPost.author.bio}</p>
                      <Button variant="outline" size="sm" className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]">
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-8 space-y-6">
                {/* Table of Contents */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Table of Contents
                    </h3>
                    <nav className="space-y-3 text-sm">
                      <a
                        href="#traditional-challenges"
                        className="block text-gray-600 hover:text-[#4a7c59] transition-colors py-1"
                      >
                        The Traditional Challenges
                      </a>
                      <a
                        href="#ai-personalization"
                        className="block text-gray-600 hover:text-[#4a7c59] transition-colors py-1"
                      >
                        AI-Powered Personalization
                      </a>
                      <a
                        href="#interactive-learning"
                        className="block text-gray-600 hover:text-[#4a7c59] transition-colors py-1"
                      >
                        Interactive Learning Experiences
                      </a>
                      <a
                        href="#pronunciation-feedback"
                        className="block text-gray-600 hover:text-[#4a7c59] transition-colors py-1"
                      >
                        Real-Time Pronunciation Feedback
                      </a>
                      <a href="#future-outlook" className="block text-gray-600 hover:text-[#4a7c59] transition-colors py-1">
                        The Future Outlook
                      </a>
                    </nav>
                  </CardContent>
                </Card>

                {/* Related Posts */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((post) => (
                        <Link key={post.id} href={`/blogs/${post.slug}`} className="block group">
                          <div className="flex gap-4">
                            <img
                              src={post.image || "/placeholder.svg"}
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