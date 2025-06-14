"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Heart, MessageCircle, Facebook, Twitter, Linkedin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BlogPostPage({ params }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(42)

  // Mock blog post data (in real app, fetch based on params.slug)
  const post = {
    id: 1,
    title: "Understanding Japanese Honorifics: A Complete Guide",
    content: `
      <p>Japanese honorifics are one of the most important aspects of the language that foreign learners must master. These linguistic expressions of respect and politeness are deeply embedded in Japanese culture and society.</p>
      
      <h2>What are Japanese Honorifics?</h2>
      <p>Honorifics, known as "keigo" (敬語) in Japanese, are special forms of language used to show respect, politeness, and social hierarchy. They are essential for proper communication in Japanese society.</p>
      
      <h3>Types of Keigo</h3>
      <p>There are three main types of keigo:</p>
      <ul>
        <li><strong>Sonkeigo (尊敬語)</strong> - Respectful language used when talking about others</li>
        <li><strong>Kenjougo (謙譲語)</strong> - Humble language used when talking about yourself</li>
        <li><strong>Teineigo (丁寧語)</strong> - Polite language using です/ます forms</li>
      </ul>
      
      <h2>Common Honorific Expressions</h2>
      <p>Here are some essential honorific expressions every Japanese learner should know:</p>
      
      <h3>Basic Greetings</h3>
      <ul>
        <li>おはようございます (Ohayou gozaimasu) - Good morning (polite)</li>
        <li>いらっしゃいませ (Irasshaimase) - Welcome (to customers)</li>
        <li>お疲れ様でした (Otsukaresama deshita) - Thank you for your hard work</li>
      </ul>
      
      <h2>When to Use Honorifics</h2>
      <p>Understanding when and how to use honorifics is crucial for effective communication in Japanese. The level of formality depends on several factors:</p>
      
      <ul>
        <li>Age and social status of the person you're speaking to</li>
        <li>Your relationship with the person</li>
        <li>The setting (formal vs. informal)</li>
        <li>The situation or context</li>
      </ul>
      
      <h2>Practice Makes Perfect</h2>
      <p>Learning honorifics takes time and practice. Start with basic polite forms and gradually work your way up to more complex expressions. Remember, it's better to be overly polite than not polite enough in Japanese culture.</p>
      
      <p>By mastering Japanese honorifics, you'll not only improve your language skills but also gain a deeper understanding of Japanese culture and society.</p>
    `,
    author: "Tanaka Sensei",
    authorBio: "Professor of Japanese Language at Tokyo University with over 15 years of teaching experience.",
    authorImage: "/placeholder.svg?height=60&width=60",
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    category: "Grammar",
    image: "/placeholder.svg?height=400&width=800",
    slug: "understanding-japanese-honorifics",
    tags: ["Grammar", "Keigo", "Politeness", "Japanese Culture"],
  }

  const relatedPosts = [
    {
      id: 2,
      title: "Japanese Verb Conjugations Made Simple",
      slug: "japanese-verb-conjugations-simple",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 3,
      title: "Understanding Japanese Particles",
      slug: "understanding-japanese-particles",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 4,
      title: "Formal vs Informal Japanese",
      slug: "formal-vs-informal-japanese",
      image: "/placeholder.svg?height=150&width=200",
    },
  ]

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const title = post.title

    let shareUrl = ""
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/blog" className="inline-flex items-center text-[#4a7c59] hover:text-[#3a6147] mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="relative">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-[#4a7c59] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>
            </div>
            <CardContent className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#2c3e2d] mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <img
                    src={post.authorImage || "/placeholder.svg"}
                    alt={post.author}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={`${isLiked ? "text-red-500 border-red-500" : ""}`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {likes}
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Comments
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-600">Share:</span>
                  <Button variant="ghost" size="sm" onClick={() => handleShare("facebook")}>
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleShare("twitter")}>
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleShare("linkedin")}>
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

                  {/* Tags */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Author Bio */}
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-start gap-4">
                      <img
                        src={post.authorImage || "/placeholder.svg"}
                        alt={post.author}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-[#2c3e2d]">{post.author}</h3>
                        <p className="text-gray-600 mt-1">{post.authorBio}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="block group">
                          <div className="flex gap-3">
                            <img
                              src={relatedPost.image || "/placeholder.svg"}
                              alt={relatedPost.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-[#2c3e2d] group-hover:text-[#4a7c59] line-clamp-2">
                                {relatedPost.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
