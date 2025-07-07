"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Eye, Upload, X, AlertCircle, LoaderCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import RichTextEditor from "@/components/richtexteditor"

// Progress Bar Component
const ProgressBar = ({ progress, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-[#4a7c59] h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

// Error Summary Component
const ErrorSummary = ({ showValidation, validationErrors }) => {
  if (!showValidation || Object.keys(validationErrors).length === 0) {
    return null
  }

  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h4 className="font-medium text-red-800">Please fix the following issues:</h4>
        </div>
        <ul className="text-sm text-red-700 space-y-1">
          {Object.values(validationErrors).map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function CreateBlogPage() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    featuredImage: null,
    featuredImageUrl: "",
    metaDescription: "",
    metaKeywords: "",
  })

  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState({})
  const [showValidation, setShowValidation] = useState(false)

  // Updated to use proper case categories that match your existing data
  const categories = ["Grammar", "Vocabulary", "Culture", "Travel", "Business", "Food", "Entertainment"]

  // Validation function
  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = "Blog title is required"
    }
    if (!formData.excerpt.trim()) {
      errors.excerpt = "Blog excerpt is required"
    }
    if (!formData.content.trim()) {
      errors.content = "Blog content is required"
    }
    if (!formData.category) {
      errors.category = "Category selection is required"
    }
    if (formData.tags.filter(tag => tag.trim()).length === 0) {
      errors.tags = "At least one tag is required"
    }

    return errors
  }

  // Render validation error helper
  const renderValidationError = (errorKey) => {
    if (showValidation && validationErrors[errorKey]) {
      return (
        <div className="flex items-center mt-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationErrors[errorKey]}
        </div>
      )
    }
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation error when user starts typing
    if (showValidation && validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

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

  // Handle rich text editor content change
  const handleContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content: content,
    }))

    // Clear content validation error
    if (showValidation && validationErrors.content) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.content
        return newErrors
      })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")

      // Clear tags validation error
      if (showValidation && validationErrors.tags) {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.tags
          return newErrors
        })
      }
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Get presigned URL
      const response = await fetch('/api/admin/blogs/s3-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, type: file.type })
      })

      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, fileUrl } = await response.json()

      // Upload to S3 with progress tracking
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(fileUrl)
          } else {
            reject(new Error('Failed to upload file'))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      const uploadedUrl = await uploadPromise

      setFormData(prev => ({
        ...prev,
        featuredImage: file,
        featuredImageUrl: uploadedUrl
      }))

    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      featuredImage: null,
      featuredImageUrl: ""
    }))
  }

  const handleSubmit = async () => {
    // Validate form
    const errors = validateForm()
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setShowValidation(true)
      // Scroll to top to show error summary
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Clear validation if form is valid
    setValidationErrors({})
    setShowValidation(false)
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      
      formDataToSend.append('title', formData.title)
      formDataToSend.append('slug', formData.slug)
      formDataToSend.append('excerpt', formData.excerpt)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('tags', JSON.stringify(formData.tags.filter(tag => tag.trim())))
      formDataToSend.append('metaDescription', formData.metaDescription)
      
      // Send S3 URL instead of file
      if (formData.featuredImageUrl) {
        formDataToSend.append('featuredImageUrl', formData.featuredImageUrl)
      }

      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create blog')
      }
      
      if (result.success) {
        alert('Blog post created successfully!')
        
        setFormData({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "",
          tags: [],
          featuredImage: null,
          featuredImageUrl: "",
          metaDescription: "",
          metaKeywords: "",
        })
        
        window.location.href = '/admin/blogs'
      }
      
    } catch (error) {
      alert(error.message || 'Error creating blog post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    console.log("Preview blog post:", formData)
    alert('Preview functionality would show a preview of your blog post')
  }

  return (
    <>
    <Header/>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/blogs" className="inline-flex items-center text-[#4a7c59] hover:text-[#3a6147]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog Management
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview} disabled={!formData.title.trim()}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button 
              className="bg-[#4a7c59] hover:bg-[#3a6147]" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Blog Post
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Summary */}
        <ErrorSummary 
          showValidation={showValidation}
          validationErrors={validationErrors}
        />

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
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent ${
                      showValidation && validationErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your blog post title"
                    required
                  />
                  {renderValidationError('title')}
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                    Excerpt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent ${
                      showValidation && validationErrors.excerpt ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of your post"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/500 characters</p>
                  {renderValidationError('excerpt')}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>Upload an optional featured image for your blog post</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.featuredImage ? (
                    <div className="relative">
                      <img
                        src={formData.featuredImageUrl || URL.createObjectURL(formData.featuredImage)}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{formData.featuredImage.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.featuredImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {formData.featuredImageUrl && (
                          <p className="text-xs text-green-600">✓ Uploaded</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a7c59] mx-auto"></div>
                          <p className="text-gray-600">Uploading to S3...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-2">Upload a featured image</p>
                          <p className="text-sm text-gray-500 mb-4">Drag and drop or click to browse</p>
                          <p className="text-xs text-gray-400">Supports: JPG, PNG, WebP (Max 5MB)</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1">
                      <ProgressBar progress={uploadProgress} />
                      <div className="text-xs text-gray-500 text-center">
                        Uploading... {uploadProgress}%
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rich Text Editor for Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Write your blog post content with rich text formatting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={showValidation && validationErrors.content ? 'border-red-500 border rounded-lg' : ''}>
                  <RichTextEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your blog post content here. Use the toolbar above for formatting..."
                  />
                </div>
                {renderValidationError('content')}
                <p className="text-xs text-gray-500 mt-2">
                  Use the toolbar above for text formatting, adding images, lists, and headings.
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Category</CardTitle>
                <CardDescription className="text-sm text-gray-600">Choose a category for your blog post</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white ${
                    showValidation && validationErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {renderValidationError('category')}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Tags</CardTitle>
                <CardDescription className="text-sm text-gray-600">Add relevant tags to help categorize your post</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                    placeholder="Add a tag"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag} 
                    className="px-3 py-2.5 bg-[#4a7c59] hover:bg-[#3a6147] text-white rounded-lg text-sm font-medium whitespace-nowrap"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Tags Display */}
                <div className="min-h-[60px]">
                  {formData.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 bg-[#eef2eb] text-[#4a7c59] px-3 py-2 rounded-lg text-sm font-medium border border-[#d1e7dd]"
                        >
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(tag)} 
                            className="hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm italic py-4">
                      No tags added yet. Add some tags to help categorize your blog post.
                    </div>
                  )}
                </div>
                {renderValidationError('tags')}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                <CardDescription className="text-sm text-gray-600">Preview or publish your blog post</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full py-3 border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] hover:border-[#3a6147]" 
                  onClick={handlePreview}
                  disabled={!formData.title.trim()}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Post
                </Button>
                <Button 
                  className="w-full py-3 bg-[#4a7c59] hover:bg-[#3a6147] text-white" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}