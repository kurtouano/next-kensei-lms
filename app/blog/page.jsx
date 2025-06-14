"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Calendar, User, Clock, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock blog data
  const featuredPost = {
    id: 1,
    title: "Understanding Japanese Honorifics: A Complete Guide",
    excerpt:
      "Master the art of Japanese politeness with our comprehensive guide to honorific language, from basic keigo to advanced expressions.",
    content: "Japanese honorifics are one of the most important aspects of the language...",
    author: "Tanaka Sensei",
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    category: "Grammar",
    image: "/placeholder.svg?height=400&width=800",
    slug: "understanding-japanese-honorifics",
  }

  const blogPosts = [
    {
      id: 2,
      title: "5 Essential Japanese Phrases for Travelers",
      excerpt:
        "Learn the most important phrases you'll need when visiting Japan, from ordering food to asking for directions.",
      author: "Yamada Sensei",
      publishedAt: "2024-01-12",
      readTime: "5 min read",
      category: "Travel",
      image: "/placeholder.svg?height=200&width=300",
      slug: "essential-japanese-phrases-travelers",
    },
    {
      id: 3,
      title: "The Art of Japanese Tea Ceremony",
      excerpt: "Discover the cultural significance and proper etiquette of the traditional Japanese tea ceremony.",
      author: "Sato Sensei",
      publishedAt: "2024-01-10",
      readTime: "6 min read",
      category: "Culture",
      image: "/placeholder.svg?height=200&width=300",
      slug: "japanese-tea-ceremony-art",
    },
    {
      id: 4,
      title: "Mastering Kanji: Study Techniques That Work",
      excerpt: "Effective strategies and methods to learn and remember kanji characters more efficiently.",
      author: "Tanaka Sensei",
      publishedAt: "2024-01-08",
      readTime: "7 min read",
      category: "Vocabulary",
      image: "/placeholder.svg?height=200&width=300",
      slug: "mastering-kanji-study-techniques",
    },
    {
      id: 5,
      title: "Japanese Business Etiquette: Do's and Don'ts",
      excerpt: "Navigate the professional world in Japan with confidence by understanding key business customs.",
      author: "Suzuki Sensei",
      publishedAt: "2024-01-05",
      readTime: "9 min read",
      category: "Business",
      image: "/placeholder.svg?height=200&width=300",
      slug: "japanese-business-etiquette",
    },
    {
      id: 6,
      title: "Seasonal Festivals in Japan: A Year-Round Guide",
      excerpt:
        "Explore Japan's rich festival culture throughout the seasons, from cherry blossom celebrations to winter illuminations.",
      author: "Watanabe Sensei",
      publishedAt: "2024-01-03",
      readTime: "10 min read",
      category: "Culture",
      image: "/placeholder.svg?height=200&width=300",
      slug: "seasonal-festivals-japan",
    },
  ]

  const categories = [
    { id: "all", name: "All Posts", count: 25 },
    { id: "grammar", name: "Grammar", count: 8 },
    { id: "vocabulary", name: "Vocabulary", count: 6 },
    { id: "culture", name: "Culture", count: 5 },
    { id: "travel", name: "Travel", count: 3 },
    { id: "business", name: "Business", count: 2 },
    { id: "food", name: "Food", count: 1 },
  ]

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#2c3e2d] mb-4">Japanese Learning Blog</h1>
            <p className="text-lg text-[#4a7c59] max-w-2xl mx-auto">
              Discover insights, tips, and cultural knowledge to enhance your Japanese learning journey
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                          selectedCategory === category.id ? "bg-[#4a7c59] text-white" : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-sm opacity-75">({category.count})</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stay Updated</CardTitle>
                  <CardDescription>Get the latest articles delivered to your inbox</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    />
                    <Button className="w-full bg-[#4a7c59] hover:bg-[#3a6147]">Subscribe</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            <Card className="mb-8 overflow-hidden">
              <div className="relative">
                <img
                  src={featuredPost.image || "/placeholder.svg"}
                  alt={featuredPost.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#4a7c59] text-white px-3 py-1 rounded-full text-sm font-medium">Featured</span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredPost.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#2c3e2d] mb-3">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{featuredPost.excerpt}</p>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Button className="bg-[#4a7c59] hover:bg-[#3a6147]">
                    Read More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 text-[#4a7c59] px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="font-bold text-[#2c3e2d] mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button size="sm" className="bg-[#4a7c59] text-white">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
