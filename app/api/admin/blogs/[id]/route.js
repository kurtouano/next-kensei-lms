// app/api/admin/blogs/[id]/route.js - SIMPLIFIED (Remove Featured Priority)
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/admin/blogs/[id] - Get single blog for editing
export async function GET(request, { params }) {
  try {
    await connectDb()
    
    const { id } = await params
    
    const blog = await Blog.findById(id)
      .populate('author', 'name icon')
    
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

// PUT /api/admin/blogs/[id] - Update blog
export async function PUT(request, { params }) {
  try {
    await connectDb()
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is admin or instructor
    const user = await User.findById(session.user.id)
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin or instructor access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    const formData = await request.formData()
    
    // Find existing blog
    const existingBlog = await Blog.findById(id)
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    // Check if user owns the blog or is admin
    if (existingBlog.author.toString() !== session.user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "You can only edit your own blog posts" },
        { status: 403 }
      )
    }

    // Extract form data
    const title = formData.get('title')
    const slug = formData.get('slug')
    const excerpt = formData.get('excerpt')
    const content = formData.get('content')
    const category = formData.get('category')
    const tagsString = formData.get('tags')
    const metaDescription = formData.get('metaDescription')
    const featuredImageUrl = formData.get('featuredImageUrl')
    
    // SIMPLIFIED: Only featured flag, no priority
    const isFeatured = formData.get('isFeatured') === 'true'

    // Parse tags
    let tags = []
    if (tagsString) {
      try {
        tags = JSON.parse(tagsString)
      } catch (e) {
        tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean)
      }
    }

    // Validation
    if (!title || !excerpt || !content || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check for duplicate slug (excluding current blog)
    if (slug !== existingBlog.slug) {
      const duplicateSlug = await Blog.findOne({ slug, _id: { $ne: id } })
      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: "A blog with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Update blog data
    const updateData = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      metaDescription,
      featuredImage: featuredImageUrl,
      isFeatured // SIMPLIFIED: Only featured flag
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name icon')

    return NextResponse.json({
      success: true,
      blog: updatedBlog,
      message: "Blog post updated successfully"
    })

  } catch (error) {
    console.error("Error updating blog:", error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "A blog with this slug already exists" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to update blog post" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blogs/[id] - Delete blog
export async function DELETE(request, { params }) {
  try {
    await connectDb()
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is admin or instructor
    const user = await User.findById(session.user.id)
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin or instructor access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    
    // Find existing blog
    const existingBlog = await Blog.findById(id)
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    // Check if user owns the blog or is admin
    if (existingBlog.author.toString() !== session.user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "You can only delete your own blog posts" },
        { status: 403 }
      )
    }

    await Blog.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post" },
      { status: 500 }
    )
  }
}