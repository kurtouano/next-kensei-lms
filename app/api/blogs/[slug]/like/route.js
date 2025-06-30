// app/api/blogs/[slug]/like/route.js
import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// POST /api/blogs/[slug]/like - Toggle like for a blog post
export async function POST(request, { params }) {
  try {
    await connectDb()
    
    // Check authentication (optional - you can allow anonymous likes)
    const session = await getServerSession(authOptions)
    
    const { slug } = await params // Await params for Next.js 15
    
    // Find blog by slug
    const blog = await Blog.findOne({ slug })
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    // For anonymous users, we'll just increment the count
    // For authenticated users, we can track individual likes
    if (session?.user?.id) {
      // Authenticated user - use the toggleLike method
      const updatedBlog = await blog.toggleLike(session.user.id)
      const isLiked = updatedBlog.likedBy.includes(session.user.id)

      return NextResponse.json({
        success: true,
        isLiked,
        likeCount: updatedBlog.likeCount,
        message: isLiked ? "Blog liked" : "Blog unliked"
      })
    } else {
      // Anonymous user - just increment the count
      const updatedBlog = await Blog.findByIdAndUpdate(
        blog._id,
        { $inc: { likeCount: 1 } },
        { new: true }
      )

      return NextResponse.json({
        success: true,
        isLiked: true,
        likeCount: updatedBlog.likeCount,
        message: "Blog liked"
      })
    }

  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    )
  }
}