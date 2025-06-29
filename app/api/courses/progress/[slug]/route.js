import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDb } from '@/lib/mongodb'
import Progress from '@/models/Progress'
import User from '@/models/User'
import Course from '@/models/Course'

// GET - Fetch user's progress for a specific course
export async function GET(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    
    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find course by slug and populate modules with lessons
    const course = await Course.findOne({ slug }).populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        model: 'Lesson'
      }
    })
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Find or create progress record using the course ObjectId
    let progress = await Progress.findOne({ 
      user: user._id, 
      course: course._id
    })
    
    if (!progress) {
      // 🔧 FIXED: Initialize progress with ALL lessons and modules from the course
      progress = await initializeProgressWithAllContent(user._id, course)
    } else {
      // 🔧 FIXED: Ensure all lessons and modules are tracked
      progress = await ensureAllContentInProgress(progress, course)
    }

    console.log('📊 GET Progress Debug:', {
      courseSlug: slug,
      totalCourseLessons: getAllLessonsFromCourse(course).length,
      totalCourseModules: course.modules.length,
      progressLessonCount: progress.lessonProgress.length,
      progressModuleCount: progress.completedModules.length,
      completedLessons: progress.lessonProgress.filter(lp => lp.isCompleted).length,
      courseProgress: progress.courseProgress
    })

    return NextResponse.json({
      success: true,
      progress: {
        completedLessons: progress.lessonProgress
          .filter(lesson => lesson.lesson && lesson.isCompleted)
          .map(lesson => lesson.lesson.toString()),
        completedModules: progress.completedModules
          .filter(module => module.module && module.quizScore >= 70) // Only passed modules
          .map(module => ({
            moduleId: module.module.toString(),
            quizScore: module.quizScore,
            completedAt: module.completedAt
          })),
        courseProgress: progress.courseProgress,
        status: progress.status,
        isCompleted: progress.isCompleted,
        lessonProgress: progress.lessonProgress.map(lp => ({
          lesson: lp.lesson?.toString(),
          currentTime: lp.currentTime || 0,
          isCompleted: lp.isCompleted || false,
          completedAt: lp.completedAt
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update lesson completion status
export async function POST(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { lessonId, isCompleted, currentTime = 0 } = body

    console.log('📝 POST Progress Update:', { slug, lessonId, isCompleted, currentTime })

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find course by slug and populate modules with their lessons
    const course = await Course.findOne({ slug }).populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        model: 'Lesson'
      }
    })
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // 🔧 FIXED: Verify lesson exists in course
    const allLessons = getAllLessonsFromCourse(course)
    const lessonExists = allLessons.some(lesson => lesson._id.toString() === lessonId.toString())
    
    if (!lessonExists) {
      return NextResponse.json({ error: 'Lesson not found in course' }, { status: 404 })
    }

    // Find or create progress record using the course ObjectId
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

    // 🔧 FIXED: Find and update existing lesson progress (no more duplicates!)
    const existingLessonIndex = progress.lessonProgress.findIndex(
      lesson => lesson.lesson && lesson.lesson.toString() === lessonId.toString()
    )

    if (existingLessonIndex >= 0) {
      // Update existing lesson progress
      progress.lessonProgress[existingLessonIndex].currentTime = currentTime
      progress.lessonProgress[existingLessonIndex].isCompleted = isCompleted
      progress.lessonProgress[existingLessonIndex].completedAt = isCompleted ? new Date() : progress.lessonProgress[existingLessonIndex].completedAt
      
      console.log('✏️ Updated existing lesson progress at index:', existingLessonIndex)
    } else {
      // This should never happen now, but as a safety net
      console.error('❌ UNEXPECTED: Lesson not found in progress array:', lessonId)
      return NextResponse.json({ error: 'Lesson not found in progress tracking' }, { status: 500 })
    }

    // Calculate overall course progress
    const totalLessons = allLessons.length
    const completedLessons = progress.lessonProgress.filter(lesson => lesson.isCompleted).length
    const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    
    console.log('📈 Progress Calculation:', {
      totalLessons,
      completedLessons,
      percentage: courseProgress
    })

    // Update progress object
    progress.courseProgress = courseProgress
    
    // Check if course is completed
    if (progress.courseProgress === 100) {
      progress.isCompleted = true
      progress.status = 'completed'
      progress.completedAt = new Date()
    } else if (progress.courseProgress > 0) {
      progress.status = 'in_progress'
    } else {
      progress.status = 'not_started'
    }

    // Mark as modified to ensure save works
    progress.markModified('lessonProgress')
    await progress.save()
    console.log('💾 Progress saved successfully')

    // Add progress to user's records if not already there
    if (!user.progressRecords.includes(progress._id)) {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { progressRecords: progress._id }
      })
    }

    return NextResponse.json({
      success: true,
      progress: {
        completedLessons: progress.lessonProgress
          .filter(lesson => lesson.lesson && lesson.isCompleted)
          .map(lesson => lesson.lesson.toString()),
        courseProgress: progress.courseProgress,
        status: progress.status,
        lessonProgress: progress.lessonProgress.map(lp => ({
          lesson: lp.lesson?.toString(),
          currentTime: lp.currentTime || 0,
          isCompleted: lp.isCompleted || false,
          completedAt: lp.completedAt
        }))
      }
    })
  } catch (error) {
    console.error('❌ Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 🔧 Helper function to get all lessons from a course
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

// 🔧 NEW: Initialize progress with ALL lessons and modules upfront
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

// 🔧 NEW: Ensure all lessons and modules are tracked (for course updates)
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
      console.log('➕ Added missing lesson to progress:', lesson.title)
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
    console.log('🗑️ Removed obsolete lessons from progress')
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
      console.log(' Added missing module to progress:', module.title)
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
    console.log('🗑️ Removed obsolete modules from progress')
  }
  
  if (needsUpdate) {
    progress.markModified('lessonProgress')
    progress.markModified('completedModules')
    await progress.save()
    console.log('🔄 Updated progress to match current course structure')
  }
  
  return progress
}