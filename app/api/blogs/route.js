// app/api/blogs/route.js - PUBLIC blog reading endpoint
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"

// GET /api/blogs - Get published blogs for public consumption
export async function GET(request) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search')

    // Build filters object for public blogs only
    const filters = {
      category: category || 'all',
      sortBy,
      search,
      dateRange: 'all',
      featured: null
    }

    // Get published blogs using the model's static method
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
    console.error("Error fetching public blogs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    )
  }
}