"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BlogForm from "@/components/BlogForm"
import { AdminPageSkeleton } from "@/components/AdminSkeleton"

export default function EditBlogPage({ params }) {
  const [blogId, setBlogId] = useState(null)
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resolve params and fetch blog data
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        const resolvedParams = await params
        setBlogId(resolvedParams.blogId)

        // Fetch existing blog data
        const response = await fetch(`/api/admin/blogs/${resolvedParams.blogId}`)
        const data = await response.json()

        if (data.success) {
          setInitialData(data.blog)
        } else {
          setError(data.error || 'Blog not found')
        }
      } catch (err) {
        console.error('Error loading blog:', err)
        setError('Failed to load blog data')
      } finally {
        setLoading(false)
      }
    }

    loadBlogData()
  }, [params])

  const handleSubmit = async (formData) => {
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
      
      // ADD THIS LINE - This was missing!
      formDataToSend.append('isFeatured', formData.isFeatured.toString())
      
      // Send S3 URL instead of file
      if (formData.featuredImageUrl) {
        formDataToSend.append('featuredImageUrl', formData.featuredImageUrl)
      }

      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update blog')
      }
      
      if (result.success) {
        alert('Blog post updated successfully!')
        window.location.href = '/admin/blogs'
      }
      
    } catch (error) {
      alert(error.message || 'Error updating blog post')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Header/>
        <AdminPageSkeleton />
        <Footer/>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <Header/>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/admin/blogs">
              <Button className="bg-[#4a7c59] hover:bg-[#3a6147]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog Management
              </Button>
            </Link>
          </div>
        </div>
        <Footer/>
      </>
    )
  }

  return (
    <>
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <BlogForm 
          mode="edit"
          initialData={initialData}
          blogId={blogId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      <Footer/>
    </>
  )
}