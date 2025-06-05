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
        status: 'not_started'
      })
      await progress.save()
      
      // Add to user's progress records
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
        completedModules: progress.completedModules
          .filter(module => module.module)
          .map(module => ({
            moduleId: module.module.toString(),
            quizScore: module.quizScore,
            completedAt: module.completedAt
          })),
        courseProgress: progress.courseProgress,
        status: progress.status,
        isCompleted: progress.isCompleted
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

    console.log('📝 Processing lesson progress update:', { slug, lessonId, isCompleted })

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // FIXED: Find course by slug and populate modules with their lessons
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

    console.log('📚 Found course:', { id: course._id, title: course.title })

    // Find or create progress record using the course ObjectId
    let progress = await Progress.findOne({ 
      user: user._id, 
      course: course._id
    })
    
    if (!progress) {
      progress = new Progress({
        user: user._id,
        course: course._id,
        status: 'in_progress'
      })
    }

    // Update lesson progress - FIXED: Add null checks
    const existingLessonIndex = progress.lessonProgress.findIndex(
      lesson => lesson.lesson && lesson.lesson.toString() === lessonId
    )

    if (existingLessonIndex >= 0) {
      // Update existing lesson progress
      progress.lessonProgress[existingLessonIndex] = {
        ...progress.lessonProgress[existingLessonIndex],
        currentTime,
        isCompleted,
        completedAt: isCompleted ? new Date() : progress.lessonProgress[existingLessonIndex].completedAt
      }
      console.log('✏️ Updated existing lesson progress')
    } else {
      // Add new lesson progress
      progress.lessonProgress.push({
        lesson: lessonId,
        currentTime,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      })
      console.log('➕ Added new lesson progress')
    }

    // FIXED: Calculate overall course progress using populated data
    let totalLessons = 0
    let courseProgress = 0

    console.log('🔍 Calculating course progress from populated data...')
    console.log('📖 Course structure:', {
      hasModules: !!course.modules,
      modulesLength: course.modules?.length || 0
    })

    if (course && course.modules && Array.isArray(course.modules)) {
      // Count total lessons across all populated modules
      totalLessons = course.modules.reduce((total, module, moduleIndex) => {
        const moduleLessons = module.lessons || []
        console.log(`📁 Module ${moduleIndex} (${module.title || 'Unnamed'}):`, {
          lessonsCount: moduleLessons.length,
          lessons: moduleLessons.map(lesson => ({ 
            id: lesson._id.toString(), 
            title: lesson.title, 
            order: lesson.order 
          }))
        })
        return total + moduleLessons.length
      }, 0)

      console.log('📊 Total lessons in course:', totalLessons)

      // Count completed lessons (only those with valid lesson IDs)
      const completedLessons = progress.lessonProgress.filter(
        lesson => lesson.lesson && lesson.isCompleted
      ).length

      console.log('✅ Completed lessons:', completedLessons)
      console.log('📋 All lesson progress:', progress.lessonProgress.map(lp => ({
        lesson: lp.lesson?.toString(),
        isCompleted: lp.isCompleted
      })))

      // Calculate percentage
      courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      
      console.log('📈 Calculated progress:', {
        completedLessons,
        totalLessons,
        percentage: courseProgress
      })
    } else {
      console.log('❌ Course modules not found or not populated properly')
    }

    // Update progress object
    progress.courseProgress = courseProgress
    
    // Check if course is completed
    if (progress.courseProgress === 100) {
      progress.isCompleted = true
      progress.status = 'completed'
      progress.completedAt = new Date()
      console.log('🎉 Course completed!')
    } else if (progress.courseProgress > 0) {
      progress.status = 'in_progress'
      console.log('🔄 Course in progress')
    }

    await progress.save()
    console.log('💾 Progress saved to database')

    // Add progress to user's records if not already there
    if (!user.progressRecords.includes(progress._id)) {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { progressRecords: progress._id }
      })
    }

    console.log('✅ Final response:', {
      completedLessons: progress.lessonProgress
        .filter(lesson => lesson.lesson && lesson.isCompleted)
        .map(lesson => lesson.lesson.toString()),
      courseProgress: progress.courseProgress,
      status: progress.status
    })

    return NextResponse.json({
      success: true,
      progress: {
        completedLessons: progress.lessonProgress
          .filter(lesson => lesson.lesson && lesson.isCompleted)
          .map(lesson => lesson.lesson.toString()),
        courseProgress: progress.courseProgress,
        status: progress.status
      }
    })
  } catch (error) {
    console.error('❌ Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}