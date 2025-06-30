// app/api/admin/blogs/route.js - Updated to handle S3 URLs
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/admin/blogs - Get all blogs with filtering
export async function GET(request) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const dateRange = searchParams.get('dateRange')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    // Build filters object
    const filters = {}
    
    if (category && category !== 'all') {
      filters.category = category
    }
    
    if (author && author !== 'all') {
      filters.author = author
    }
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      switch (dateRange) {
        case 'last-month':
          filters.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) }
          break
        case 'last-3-months':
          filters.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 3)) }
          break
        case 'last-year':
          filters.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) }
          break
      }
    }

    // Sort options
    let sortOptions = { createdAt: -1 } // Default: newest first
    switch (sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 }
        break
      case 'popular':
        sortOptions = { views: -1, likeCount: -1 }
        break
      case 'newest':
      default:
        sortOptions = { createdAt: -1 }
        break
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get blogs with pagination
    const blogs = await Blog.find(filters)
      .populate('author', 'name icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(filters)
    const totalPages = Math.ceil(totalBlogs / limit)

    // Get category statistics
    const categoryStats = await Blog.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    return NextResponse.json({
      success: true,
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      categoryStats
    })

  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    )
  }
}

// POST /api/admin/blogs - Create new blog with S3 support
export async function POST(request) {
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

    // Check if user has permission to create blogs (instructor or admin)
    const user = await User.findById(session.user.id)
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    
    // Extract form data
    const blogData = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      category: formData.get('category'),
      tags: JSON.parse(formData.get('tags') || '[]'),
      metaDescription: formData.get('metaDescription'),
      author: session.user.id
    }

    // Handle S3 featured image URL (updated to handle S3 URLs instead of file uploads)
    const featuredImageUrl = formData.get('featuredImageUrl')
    if (featuredImageUrl) {
      blogData.featuredImage = featuredImageUrl
    }

    // Validate required fields
    if (!blogData.title || !blogData.excerpt || !blogData.content || !blogData.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Auto-generate slug if not provided
    if (!blogData.slug) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
    }

    // Check for slug uniqueness
    const existingBlog = await Blog.findOne({ slug: blogData.slug })
    if (existingBlog) {
      // Auto-generate a unique slug
      const baseSlug = blogData.slug
      let counter = 1
      let newSlug = `${baseSlug}-${counter}`
      
      while (await Blog.findOne({ slug: newSlug })) {
        counter++
        newSlug = `${baseSlug}-${counter}`
      }
      
      blogData.slug = newSlug
    }

    // Create the blog post
    const blog = new Blog(blogData)
    await blog.save()

    // Populate author data for response
    await blog.populate('author', 'name icon')

    return NextResponse.json({
      success: true,
      message: "Blog post created successfully",
      blog
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating blog:", error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create blog post" },
      { status: 500 }
    )
  }
}