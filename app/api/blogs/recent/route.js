// app/api/blogs/recent/route.js
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"

// GET /api/blogs/recent - Get recent blogs (non-featured)
export async function GET(request) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 6

    const recentBlogs = await Blog.getRecentBlogs(limit)

    return NextResponse.json({
      success: true,
      blogs: recentBlogs,
      count: recentBlogs.length
    })

  } catch (error) {
    console.error("Error fetching recent blogs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch recent blogs" },
      { status: 500 }
    )
  }
}