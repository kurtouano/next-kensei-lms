// app/api/admin/blogs/[id]/route.js
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/admin/blogs/[id] - Get single blog by ID
export async function GET(request, { params }) {
  try {
    await connectDb()
    
    const { id } = await params
    
    // Find blog by ID and populate author
    const blog = await Blog.findById(id)
      .populate('author', 'name icon')
      .lean()
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      blog
    })

  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blogs/[id] - Update blog by ID
export async function PUT(request, { params }) {
  try {
    await connectDb()
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has permission to edit blogs (instructor or admin)
    const user = await User.findById(session.user.id)
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params
    const formData = await request.formData()
    
    // Extract form data
    const updateData = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      category: formData.get('category'),
      tags: JSON.parse(formData.get('tags') || '[]'),
      metaDescription: formData.get('metaDescription'),
      updatedAt: new Date()
    }

    // Handle S3 featured image URL
    const featuredImageUrl = formData.get('featuredImageUrl')
    if (featuredImageUrl) {
      updateData.featuredImage = featuredImageUrl
    }

    // Validate required fields
    if (!updateData.title || !updateData.excerpt || !updateData.content || !updateData.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if slug is unique (excluding current blog)
    if (updateData.slug) {
      const existingBlog = await Blog.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: id } 
      })
      
      if (existingBlog) {
        return NextResponse.json(
          { success: false, error: "Slug already exists" },
          { status: 400 }
        )
      }
    }

    // Update the blog post
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name icon')

    if (!updatedBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Blog post updated successfully",
      blog: updatedBlog
    })

  } catch (error) {
    console.error("Error updating blog:", error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update blog post" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blogs/[id] - Delete blog by ID
export async function DELETE(request, { params }) {
  try {
    await connectDb()
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has permission to delete blogs (instructor or admin)
    const user = await User.findById(session.user.id)
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Find and delete the blog post
    const deletedBlog = await Blog.findByIdAndDelete(id)

    if (!deletedBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    // Optional: Delete the featured image from S3 if needed
    // You can add S3 deletion logic here if you want to clean up images

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully",
      deletedBlog: {
        id: deletedBlog._id,
        title: deletedBlog.title
      }
    })

  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post" },
      { status: 500 }
    )
  }
}