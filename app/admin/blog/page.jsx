"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminBlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Understanding Japanese Honorifics: A Complete Guide",
      author: "Tanaka Sensei",
      status: "published",
      publishedAt: "2024-01-15",
      views: 1250,
      category: "Grammar",
    },
    {
      id: 2,
      title: "5 Essential Japanese Phrases for Travelers",
      author: "Yamada Sensei",
      status: "published",
      publishedAt: "2024-01-12",
      views: 890,
      category: "Travel",
    },
    {
      id: 3,
      title: "The Art of Japanese Tea Ceremony",
      author: "Sato Sensei",
      status: "draft",
      publishedAt: null,
      views: 0,
      category: "Culture",
    },
    {
      id: 4,
      title: "Mastering Kanji: Study Techniques That Work",
      author: "Tanaka Sensei",
      status: "published",
      publishedAt: "2024-01-08",
      views: 2100,
      category: "Vocabulary",
    },
    {
      id: 5,
      title: "Japanese Business Etiquette: Do's and Don'ts",
      author: "Suzuki Sensei",
      status: "scheduled",
      publishedAt: "2024-01-20",
      views: 0,
      category: "Business",
    },
  ]

  const stats = {
    totalPosts: blogPosts.length,
    published: blogPosts.filter((post) => post.status === "published").length,
    drafts: blogPosts.filter((post) => post.status === "draft").length,
    totalViews: blogPosts.reduce((sum, post) => sum + post.views, 0),
  }

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
    }
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2c3e2d]">Blog Management</h1>
          <p className="text-[#4a7c59]">Create and manage your blog posts</p>
        </div>
        <Link href="/admin/blog/create">
          <Button className="bg-[#4a7c59] hover:bg-[#3a6147]">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>Manage your blog posts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium">Title</th>
                  <th className="pb-3 text-left font-medium">Author</th>
                  <th className="pb-3 text-left font-medium">Category</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-left font-medium">Published</th>
                  <th className="pb-3 text-left font-medium">Views</th>
                  <th className="pb-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b">
                    <td className="py-4">
                      <div className="font-medium text-[#2c3e2d] max-w-xs truncate">{post.title}</div>
                    </td>
                    <td className="py-4 text-gray-600">{post.author}</td>
                    <td className="py-4 text-gray-600">{post.category}</td>
                    <td className="py-4">{getStatusBadge(post.status)}</td>
                    <td className="py-4 text-gray-600">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-4 text-gray-600">{post.views.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
