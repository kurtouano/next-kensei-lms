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

    // Find course by slug first to get the actual ObjectId
    const course = await Course.findOne({ slug })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Find or create progress record using the course ObjectId
    let progress = await Progress.findOne({ 
      user: user._id, 
      course: course._id
    })
    
    if (!progress) {
      // Create new progress record if doesn't exist
      progress = new Progress({
        user: user._id,
        course: course._id,
        status: 'not_started',
        lessonProgress: [],
        completedModules: [],
        courseProgress: 0
      })
      await progress.save()
      
      // Add to user's progress records
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { progressRecords: progress._id }
      })
    }

    console.log('📊 GET Progress Debug:', {
      courseSlug: slug,
      progressId: progress._id,
      lessonProgressCount: progress.lessonProgress.length,
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
          .filter(module => module.module)
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

    // Find or create progress record using the course ObjectId
    let progress = await Progress.findOne({ 
      user: user._id, 
      course: course._id
    })
    
    if (!progress) {
      progress = new Progress({
        user: user._id,
        course: course._id,
        status: 'in_progress',
        lessonProgress: [],
        completedModules: [],
        courseProgress: 0
      })
    }

    // FIXED: Prevent duplicates by checking for existing lesson progress properly
    const existingLessonIndex = progress.lessonProgress.findIndex(
      lesson => lesson.lesson && lesson.lesson.toString() === lessonId.toString()
    )

    if (existingLessonIndex >= 0) {
      // Update existing lesson progress
      progress.lessonProgress[existingLessonIndex] = {
        lesson: lessonId,
        currentTime,
        isCompleted,
        completedAt: isCompleted ? new Date() : progress.lessonProgress[existingLessonIndex].completedAt || null
      }
      console.log('✏️ Updated existing lesson progress at index:', existingLessonIndex)
    } else {
      // Add new lesson progress only if it doesn't exist
      progress.lessonProgress.push({
        lesson: lessonId,
        currentTime,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      })
      console.log('➕ Added new lesson progress')
    }

    // FIXED: Clean up any duplicate lesson progress entries
    const uniqueLessonProgress = []
    const seenLessons = new Set()
    
    for (const lp of progress.lessonProgress) {
      if (lp.lesson && !seenLessons.has(lp.lesson.toString())) {
        uniqueLessonProgress.push(lp)
        seenLessons.add(lp.lesson.toString())
      }
    }
    
    progress.lessonProgress = uniqueLessonProgress
    console.log('🧹 Cleaned up duplicates. Unique lessons:', uniqueLessonProgress.length)

    // Calculate overall course progress using populated data
    let totalLessons = 0
    let courseProgress = 0

    if (course && course.modules && Array.isArray(course.modules)) {
      // Count total lessons across all populated modules
      totalLessons = course.modules.reduce((total, module) => {
        const moduleLessons = module.lessons || []
        return total + moduleLessons.length
      }, 0)

      // Count completed lessons (only those with valid lesson IDs)
      const completedLessons = progress.lessonProgress.filter(
        lesson => lesson.lesson && lesson.isCompleted
      ).length

      // Calculate percentage
      courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      
      console.log('📈 Progress Calculation:', {
        totalLessons,
        completedLessons,
        percentage: courseProgress
      })
    }

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