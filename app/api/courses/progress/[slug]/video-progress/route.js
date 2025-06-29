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

    // Find the course with populated lessons
    const course = await Course.findOne({ slug }).populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        model: 'Lesson'
      }
    })
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: "Course not found" 
      }, { status: 404 })
    }

    // 🔧 FIXED: Verify lesson exists in course
    const allLessons = getAllLessonsFromCourse(course)
    const lessonExists = allLessons.some(lesson => lesson._id.toString() === lessonId.toString())
    
    if (!lessonExists) {
      return NextResponse.json({ 
        success: false, 
        error: "Lesson not found in course" 
      }, { status: 404 })
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      user: user._id,
      course: course._id
    })

    if (!progress) {
      // 🔧 FIXED: Initialize with all lessons and modules
      progress = await initializeProgressWithAllContent(user._id, course)
    } else {
      // 🔧 FIXED: Ensure all content is tracked
      progress = await ensureAllContentInProgress(progress, course)
    }

    // 🔧 FIXED: Find existing lesson progress (should always exist now)
    const existingLessonIndex = progress.lessonProgress.findIndex(
      lp => lp.lesson && lp.lesson.toString() === lessonId
    )

    if (existingLessonIndex >= 0) {
      // Update ONLY the currentTime, preserve other fields
      progress.lessonProgress[existingLessonIndex].currentTime = currentTime
      console.log('⏰ Updated video progress for lesson:', lessonId, 'time:', currentTime)
    } else {
      // This should never happen now
      console.error('❌ UNEXPECTED: Lesson not found in progress array:', lessonId)
      return NextResponse.json({ 
        success: false, 
        error: "Lesson not found in progress tracking" 
      }, { status: 500 })
    }

    // Mark as modified and save
    progress.markModified('lessonProgress')
    await progress.save()

    return NextResponse.json({
      success: true,
      message: "Video progress updated successfully",
      progress: {
        lessonProgress: progress.lessonProgress.map(lp => ({
          lesson: lp.lesson?.toString(),
          currentTime: lp.currentTime || 0,
          isCompleted: lp.isCompleted || false,
          completedAt: lp.completedAt
        }))
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

// 🔧 Helper functions (same as in main progress route)
function getAllLessonsFromCourse(course) {
  const allLessons = []
  
  if (course.modules && Array.isArray(course.modules)) {
    course.modules.forEach(module => {
      if (module.lessons && Array.isArray(module.lessons)) {
        allLessons.push(...module.lessons)
      }
    })
  }
  
  return allLessons
}

async function initializeProgressWithAllContent(userId, course) {
  const allLessons = getAllLessonsFromCourse(course)
  
  // Initialize all lessons
  const initialLessonProgress = allLessons.map(lesson => ({
    lesson: lesson._id,
    currentTime: 0,
    isCompleted: false,
    completedAt: null
  }))

  // Initialize all modules
  const initialModuleProgress = course.modules.map(module => ({
    module: module._id,
    completedAt: null,
    quizScore: 0
  }))

  const progress = new Progress({
    user: userId,
    course: course._id,
    status: 'not_started',
    lessonProgress: initialLessonProgress,
    completedModules: initialModuleProgress,
    courseProgress: 0
  })

  await progress.save()
  
  console.log('🎯 Initialized progress with', allLessons.length, 'lessons and', course.modules.length, 'modules')
  
  return progress
}

async function ensureAllContentInProgress(progress, course) {
  const allLessons = getAllLessonsFromCourse(course)
  let needsUpdate = false
  
  // ===== LESSON TRACKING =====
  const trackedLessonIds = new Set(
    progress.lessonProgress
      .filter(lp => lp.lesson)
      .map(lp => lp.lesson.toString())
  )
  
  // Add any missing lessons
  allLessons.forEach(lesson => {
    if (!trackedLessonIds.has(lesson._id.toString())) {
      progress.lessonProgress.push({
        lesson: lesson._id,
        currentTime: 0,
        isCompleted: false,
        completedAt: null
      })
      needsUpdate = true
    }
  })
  
  // Remove any lessons that no longer exist in the course
  const validLessonIds = new Set(allLessons.map(lesson => lesson._id.toString()))
  const originalLessonLength = progress.lessonProgress.length
  
  progress.lessonProgress = progress.lessonProgress.filter(lp => {
    if (!lp.lesson) return false
    return validLessonIds.has(lp.lesson.toString())
  })
  
  if (progress.lessonProgress.length !== originalLessonLength) {
    needsUpdate = true
  }

  // ===== MODULE TRACKING =====
  const trackedModuleIds = new Set(
    progress.completedModules
      .filter(cm => cm.module)
      .map(cm => cm.module.toString())
  )
  
  // Add any missing modules
  course.modules.forEach(module => {
    if (!trackedModuleIds.has(module._id.toString())) {
      progress.completedModules.push({
        module: module._id,
        completedAt: null,
        quizScore: 0
      })
      needsUpdate = true
    }
  })
  
  // Remove any modules that no longer exist in the course
  const validModuleIds = new Set(course.modules.map(module => module._id.toString()))
  const originalModuleLength = progress.completedModules.length
  
  progress.completedModules = progress.completedModules.filter(cm => {
    if (!cm.module) return false
    return validModuleIds.has(cm.module.toString())
  })
  
  if (progress.completedModules.length !== originalModuleLength) {
    needsUpdate = true
  }
  
  if (needsUpdate) {
    progress.markModified('lessonProgress')
    progress.markModified('completedModules')
    await progress.save()
    console.log('🔄 Updated progress to match current course structure')
  }
  
  return progress
}