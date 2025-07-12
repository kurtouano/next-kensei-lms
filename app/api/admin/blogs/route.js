// app/api/admin/blogs/route.js - SIMPLIFIED (Remove Featured Priority)
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/admin/blogs - Get all blogs with filters and pagination
export async function GET(request) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')
    const featured = searchParams.get('featured')

    // Build filters object
    const filters = {
      category: category || 'all',
      sortBy,
      search,
      dateRange: dateRange || 'all',
      featured
    }

    // Get blogs using the model's static method
    let blogsQuery = Blog.getBlogs(filters)
    
    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(blogsQuery.getQuery())
    
    // Apply pagination
    const skip = (page - 1) * limit
    const blogs = await blogsQuery.skip(skip).limit(limit)

    // Calculate pagination info
    const totalPages = Math.ceil(totalBlogs / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      blogs,
      count: blogs.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage,
        hasPrevPage,
        limit
      },
      filters: filters
    })

  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    )
  }
}

// POST /api/admin/blogs - Create new blog
export async function POST(request) {
  try {
    await connectDb()
    
    // Check authentication and admin role
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

    const formData = await request.formData()
    
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

    // Check for duplicate slug
    const existingBlog = await Blog.findOne({ slug })
    if (existingBlog) {
      return NextResponse.json(
        { success: false, error: "A blog with this slug already exists" },
        { status: 400 }
      )
    }

    // Create blog post
    const blogData = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      metaDescription,
      featuredImage: featuredImageUrl,
      author: session.user.id,
      isFeatured // SIMPLIFIED: Only featured flag
    }

    const blog = new Blog(blogData)
    await blog.save()

    // Populate author info for response
    await blog.populate('author', 'name icon')

    return NextResponse.json({
      success: true,
      blog,
      message: "Blog post created successfully"
    })

  } catch (error) {
    console.error("Error creating blog:", error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "A blog with this slug already exists" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create blog post" },
      { status: 500 }
    )
  }
}