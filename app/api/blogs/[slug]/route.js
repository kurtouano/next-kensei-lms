// app/api/blogs/[slug]/route.js
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"

// GET /api/blogs/[slug] - Get single blog by slug
export async function GET(request, { params }) {
  try {
    await connectDb()
    
    const { slug } = await params // Await params for Next.js 15
    
    // Find blog by slug and populate author
    const blog = await Blog.findOne({ slug })
      .populate('author', 'name icon')
      .lean()
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    // Increment view count (fire and forget)
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec()

    // Get related posts from the same category
    const relatedPosts = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title slug featuredImage readTime')
    .populate('author', 'name')
    .lean()

    return NextResponse.json({
      success: true,
      blog,
      relatedPosts
    })

  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    )
  }
}