import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDb } from '@/lib/mongodb'
import Progress from '@/models/Progress'
import User from '@/models/User'
import Course from '@/models/Course'

// PUT - Update module completion and quiz score
export async function PUT(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { moduleId, quizScore } = body

    // Validate input
    if (!moduleId || quizScore === undefined) {
      return NextResponse.json({ 
        error: 'Module ID and quiz score are required' 
      }, { status: 400 })
    }

    if (quizScore < 0 || quizScore > 100) {
      return NextResponse.json({ 
        error: 'Quiz score must be between 0 and 100' 
      }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // FIXED: Find course by slug and populate modules
    const course = await Course.findOne({ slug }).populate('modules')
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Find progress record using the course ObjectId
    let progress = await Progress.findOne({ 
      user: user._id, 
      course: course._id
    })
    
    if (!progress) {
      // Create progress record if it doesn't exist
      progress = new Progress({
        user: user._id,
        course: course._id,
        status: 'in_progress'
      })
    }

    // Check if module exists in the course
    const moduleExists = course.modules.some(module => 
      module._id.toString() === moduleId
    )
    
    if (!moduleExists) {
      return NextResponse.json({ error: 'Module not found in course' }, { status: 404 })
    }

    // Update module completion - FIXED: Add null checks
    const existingModuleIndex = progress.completedModules.findIndex(
      module => module.module && module.module.toString() === moduleId
    )

    if (existingModuleIndex >= 0) {
      // Update existing module
      progress.completedModules[existingModuleIndex].quizScore = quizScore
      progress.completedModules[existingModuleIndex].completedAt = new Date()
    } else {
      // Add new completed module
      progress.completedModules.push({
        module: moduleId,
        completedAt: new Date(),
        quizScore
      })
    }

    // Update overall progress status
    if (progress.completedModules.length === course.modules.length) {
      // Check if all modules passed (score >= 70)
      const allModulesPassed = progress.completedModules.every(
        module => module.quizScore >= 70
      )
      
      if (allModulesPassed) {
        progress.status = 'completed'
        progress.isCompleted = true
        progress.completedAt = new Date()
      }
    } else {
      progress.status = 'in_progress'
    }

    await progress.save()

    // Add progress to user's records if not already there
    if (!user.progressRecords.includes(progress._id)) {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { progressRecords: progress._id }
      })
    }

    return NextResponse.json({
      success: true,
      completedModules: progress.completedModules
        .filter(module => module.module)
        .map(module => ({
          moduleId: module.module.toString(),
          quizScore: module.quizScore,
          completedAt: module.completedAt
        })),
      courseStatus: progress.status,
      isCompleted: progress.isCompleted
    })
  } catch (error) {
    console.error('Error updating module progress:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// GET - Get module completion status for a course
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

    // Find progress record using the course ObjectId
    const progress = await Progress.findOne({ 
      user: user._id, 
      course: course._id
    })
    
    if (!progress) {
      return NextResponse.json({
        success: true,
        completedModules: [],
        courseStatus: 'not_started',
        isCompleted: false
      })
    }

    return NextResponse.json({
      success: true,
      completedModules: progress.completedModules
        .filter(module => module.module)
        .map(module => ({
          moduleId: module.module.toString(),
          quizScore: module.quizScore,
          completedAt: module.completedAt
        })),
      courseStatus: progress.status,
      isCompleted: progress.isCompleted
    })
  } catch (error) {
    console.error('Error fetching module progress:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}