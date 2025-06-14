"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CreateBlogPage() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    featuredImage: null,
    status: "draft",
    publishDate: "",
    metaDescription: "",
    metaKeywords: "",
  })

  const [newTag, setNewTag] = useState("")

  const categories = ["Grammar", "Vocabulary", "Culture", "Travel", "Business", "Food", "Entertainment"]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-generate slug from title
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-")
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        featuredImage: file,
      }))
    }
  }

  const handleSubmit = (status) => {
    const submitData = {
      ...formData,
      status: status,
    }
    console.log("Submitting blog post:", submitData)
    // Here you would send the data to your backend API
    alert(`Blog post ${status === "published" ? "published" : "saved as draft"} successfully!`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/blog" className="inline-flex items-center text-[#4a7c59] hover:text-[#3a6147]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog Management
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit("draft")}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button className="bg-[#4a7c59] hover:bg-[#3a6147]" onClick={() => handleSubmit("published")}>
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
                <CardDescription>Basic information about your blog post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    placeholder="Enter your blog post title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    placeholder="url-friendly-slug"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">URL: /blog/{formData.slug}</p>
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    placeholder="Brief description of your post"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Write your blog post content</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  placeholder="Write your blog post content here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can use HTML tags for formatting. In a real application, you'd integrate a rich text editor like
                  TinyMCE or Quill.
                </p>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize your post for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium mb-2">
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    placeholder="Brief description for search engines (150-160 characters)"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                </div>

                <div>
                  <label htmlFor="metaKeywords" className="block text-sm font-medium mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="metaKeywords"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {formData.status === "scheduled" && (
                  <div>
                    <label htmlFor="publishDate" className="block text-sm font-medium mb-2">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      id="publishDate"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                      placeholder="Add a tag"
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-2 py-1 rounded text-sm"
                      >
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.featuredImage ? (
                      <div>
                        <img
                          src={URL.createObjectURL(formData.featuredImage) || "/placeholder.svg"}
                          alt="Featured"
                          className="max-w-full h-32 object-cover mx-auto rounded"
                        />
                        <p className="text-sm text-gray-600 mt-2">{formData.featuredImage.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
