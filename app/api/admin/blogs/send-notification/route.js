import { NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Blog from "@/models/Blog"
import Subscriber from "@/models/Subscriber"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sendBlogNotificationEmail } from "@/lib/blogEmailService"

// POST /api/admin/blogs/send-notification - Manually send blog notification
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

    const { blogId } = await request.json()
    
    if (!blogId) {
      return NextResponse.json(
        { success: false, error: "Blog ID is required" },
        { status: 400 }
      )
    }

    // Get the blog post
    const blog = await Blog.findById(blogId)
      .populate('author', 'name icon')
      .lean()
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      )
    }

    // Get active subscribers
    const activeSubscribers = await Subscriber.find({ isActive: true }).select('email')
    
    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers to notify",
        subscribersCount: 0
      })
    }

    // Send email notifications
    await sendBlogNotificationEmail(blog, activeSubscribers)

    return NextResponse.json({
      success: true,
      message: `Blog notification sent to ${activeSubscribers.length} subscribers`,
      subscribersCount: activeSubscribers.length,
      blogTitle: blog.title
    })

  } catch (error) {
    console.error("Error sending blog notification:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send blog notification" },
      { status: 500 }
    )
  }
}
