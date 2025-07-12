// app/api/blogs/featured/route.js
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"

// GET /api/blogs/featured - Get featured blogs
export async function GET(request) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 3

    const featuredBlogs = await Blog.getFeaturedBlogs(limit)

    return NextResponse.json({
      success: true,
      blogs: featuredBlogs,
      count: featuredBlogs.length
    })

  } catch (error) {
    console.error("Error fetching featured blogs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured blogs" },
      { status: 500 }
    )
  }
}