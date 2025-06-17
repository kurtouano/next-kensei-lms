// Updated app/api/courses/[slug]/progress/module-progress/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDb } from '@/lib/mongodb'
import Progress from '@/models/Progress'
import User from '@/models/User'
import Course from '@/models/Course'

// PUT - Update module completion and quiz score with improved logic
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

    console.log('📝 Module progress update request:', { slug, moduleId, quizScore })

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

    // Find course by slug and populate modules
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

    // Find existing module completion record
    const existingModuleIndex = progress.completedModules.findIndex(
      module => module.module && module.module.toString() === moduleId
    )

    let shouldUpdate = false
    let wasUpdated = false

    if (existingModuleIndex >= 0) {
      // Module already completed - check if we should update
      const existingScore = progress.completedModules[existingModuleIndex].quizScore
      
      console.log('📊 Existing module found:', { existingScore, newScore: quizScore })
      
      // Update only if new score is higher than existing score
      if (quizScore > existingScore) {
        progress.completedModules[existingModuleIndex].quizScore = quizScore
        progress.completedModules[existingModuleIndex].completedAt = new Date()
        shouldUpdate = true
        wasUpdated = true
        console.log('✅ Score improved - updating database')
      } else {
        console.log('📉 Score not improved - skipping database update')
        shouldUpdate = false
      }
    } else {
      // New module completion - only add if score >= 70
      if (quizScore >= 70) {
        progress.completedModules.push({
          module: moduleId,
          completedAt: new Date(),
          quizScore
        })
        shouldUpdate = true
        wasUpdated = true
        console.log('🎉 First time passing - adding to database')
      } else {
        console.log('❌ Score below 70 - not adding to database')
        shouldUpdate = false
      }
    }

    // Only save if we made changes
    if (shouldUpdate) {
      // Update overall progress status
      const passedModules = progress.completedModules.filter(module => module.quizScore >= 70)
      
      if (passedModules.length === course.modules.length) {
        // Check if all modules passed (score >= 70)
        const allModulesPassed = progress.completedModules.every(
          module => module.quizScore >= 70
        )
        
        if (allModulesPassed) {
          progress.status = 'completed'
          progress.isCompleted = true
          progress.completedAt = new Date()
          console.log('🏆 Course completed!')
        }
      } else {
        progress.status = 'in_progress'
      }

      await progress.save()
      console.log('💾 Progress saved to database')

      // Add progress to user's records if not already there
      if (!user.progressRecords.includes(progress._id)) {
        await User.findByIdAndUpdate(user._id, {
          $addToSet: { progressRecords: progress._id }
        })
      }
    }

    return NextResponse.json({
      success: true,
      updated: wasUpdated,
      message: wasUpdated ? 'Quiz score updated successfully' : 'Quiz completed but score not saved (not an improvement)',
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