"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BlogForm from "@/components/BlogForm"

export default function CreateBlogPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fixed handleSubmit function for your create page
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
        window.location.href = '/admin/blogs'
      }
      
    } catch (error) {
      alert(error.message || 'Error creating blog post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <BlogForm 
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      <Footer/>
    </>
  )
}