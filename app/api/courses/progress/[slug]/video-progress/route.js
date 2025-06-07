import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Progress from "@/models/Progress"
import Course from "@/models/Course"
import User from "@/models/User"

export async function PUT(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 })
    }

    const { slug } = await params
    const { lessonId, currentTime } = await request.json()

    if (!lessonId || currentTime === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: "Lesson ID and current time are required" 
      }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Find the course
    const course = await Course.findOne({ slug })
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: "Course not found" 
      }, { status: 404 })
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      user: user._id,
      course: course._id
    })

    if (!progress) {
      progress = new Progress({
        user: user._id,
        course: course._id,
        lessonProgress: [],
        completedLessons: [],
        completedModules: [],
        courseProgress: 0,
        status: 'not_started'
      })
    }

    // Find existing lesson progress or create new one
    const existingLessonIndex = progress.lessonProgress.findIndex(
      lp => lp.lesson && lp.lesson.toString() === lessonId
    )

    if (existingLessonIndex >= 0) {
      // Update existing lesson progress - only update currentTime, preserve other fields
      progress.lessonProgress[existingLessonIndex].currentTime = currentTime
    } else {
      // Add new lesson progress
      progress.lessonProgress.push({
        lesson: lessonId,
        currentTime: currentTime,
        isCompleted: false
      })
    }

    // Mark as modified and save
    progress.markModified('lessonProgress')
    await progress.save()

    return NextResponse.json({
      success: true,
      message: "Video progress updated successfully",
      progress: {
        lessonProgress: progress.lessonProgress
      }
    })

  } catch (error) {
    console.error("Error updating video progress:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update video progress",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}