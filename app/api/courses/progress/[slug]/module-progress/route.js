// Fixed app/api/courses/[slug]/progress/module-progress/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDb } from '@/lib/mongodb'
import Progress from '@/models/Progress'
import User from '@/models/User'
import Course from '@/models/Course'

// PUT - Update module completion and quiz score with NO DUPLICATES
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

    // 🔧 FIXED: Verify module exists in course
    const moduleExists = course.modules.some(module => 
      module._id.toString() === moduleId
    )
    
    if (!moduleExists) {
      return NextResponse.json({ error: 'Module not found in course' }, { status: 404 })
    }

    // Find progress record using the course ObjectId
    let progress = await Progress.findOne({ 
      user: user._id, 
      course: course._id
    })
    
    if (!progress) {
      // 🔧 FIXED: Initialize with all modules pre-created
      progress = await initializeProgressWithAllContent(user._id, course)
    } else {
      // 🔧 FIXED: Ensure all modules are tracked
      progress = await ensureAllContentInProgress(progress, course)
    }

    // 🔧 FIXED: Find existing module completion record (should always exist now)
    const existingModuleIndex = progress.completedModules.findIndex(
      module => module.module && module.module.toString() === moduleId
    )

    let shouldUpdate = false
    let wasUpdated = false

    if (existingModuleIndex >= 0) {
      // Module tracking already exists - check if we should update
      const existingScore = progress.completedModules[existingModuleIndex].quizScore
      
      console.log('📊 Existing module found:', { existingScore, newScore: quizScore })
      
      // Update if new score is higher OR if this is the first time passing (>= 70)
      if (quizScore > existingScore || (quizScore >= 70 && existingScore < 70)) {
        progress.completedModules[existingModuleIndex].quizScore = quizScore
        progress.completedModules[existingModuleIndex].completedAt = quizScore >= 70 ? new Date() : null
        shouldUpdate = true
        wasUpdated = true
        console.log('✅ Score updated in existing module entry')
      } else {
        console.log('📉 Score not improved - skipping database update')
        shouldUpdate = false
      }
    } else {
      // This should never happen now since we pre-initialize all modules
      console.error('❌ UNEXPECTED: Module not found in progress array:', moduleId)
      return NextResponse.json({ error: 'Module not found in progress tracking' }, { status: 500 })
    }

    // Only save if we made changes
    if (shouldUpdate) {
      // Update overall progress status
      const passedModules = progress.completedModules.filter(module => module.quizScore >= 70)
      
      if (passedModules.length === course.modules.length) {
        // All modules passed
        progress.status = 'completed'
        progress.isCompleted = true
        progress.completedAt = new Date()
        console.log('🏆 Course completed!')
        
        // Handle course completion rewards
        const rewardData = await handleCourseCompletionRewards(user, course)
        
        // Store reward data in progress record
        if (rewardData) {
          progress.rewardData = rewardData
        }
      } else if (passedModules.length > 0) {
        progress.status = 'in_progress'
      } else {
        progress.status = 'not_started'
      }

      progress.markModified('completedModules')
      await progress.save()
      console.log('💾 Module progress saved to database')

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
        .filter(module => module.module && module.quizScore >= 70) // Only return passed modules
        .map(module => ({
          moduleId: module.module.toString(),
          quizScore: module.quizScore,
          completedAt: module.completedAt
        })),
      courseStatus: progress.status,
      isCompleted: progress.isCompleted,
      rewardData: rewardData || null
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
      // Initialize if doesn't exist
      progress = await initializeProgressWithAllContent(user._id, course)
    }

    return NextResponse.json({
      success: true,
      completedModules: progress.completedModules
        .filter(module => module.module && module.quizScore >= 70)
        .map(module => ({
          moduleId: module.module.toString(),
          quizScore: module.quizScore,
          completedAt: module.completedAt
        })),
      courseStatus: progress.status,
      isCompleted: progress.isCompleted,
      rewardData: progress.rewardData || null
    })
  } catch (error) {
    console.error('Error fetching module progress:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// 🔧 Helper functions (shared with main progress route)
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

  // 🔧 FIXED: Initialize all modules upfront
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
      console.log('➕ Added missing module to progress:', module.title)
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
  
  if (needsUpdate) {
    progress.markModified('lessonProgress')
    progress.markModified('completedModules')
    await progress.save()
    console.log('🔄 Updated progress to match current course structure')
  }
  
  return progress
}

// Handle course completion rewards (credits and random items)
async function handleCourseCompletionRewards(user, course) {
  try {
    console.log('🎁 Processing course completion rewards for:', course.title)
    
    let totalCreditsEarned = 0
    let itemReward = null
    let rewardData = {
      creditsEarned: 0,
      itemsEarned: [],
      courseTitle: course.title
    }
    
    // 1. Give credit reward if course has one
    if (course.creditReward > 0) {
      user.credits += course.creditReward
      totalCreditsEarned += course.creditReward
      rewardData.creditsEarned += course.creditReward
      console.log(`💰 Added ${course.creditReward} credits from course reward`)
    }
    
    // 2. Handle random item reward if enabled
    if (course.randomReward) {
      // Get user's bonsai data to check owned items
      const Bonsai = (await import('@/models/Bonsai')).default
      let bonsai = await Bonsai.findOne({ userRef: user._id })
      
      if (!bonsai) {
        // Create bonsai if it doesn't exist
        bonsai = new Bonsai({ userRef: user._id })
        await bonsai.save()
      }
      
      // Get all shop items and filter out owned/unlocked ones
      const { getAllShopItems } = await import('@/components/bonsai/shopItems.js')
      const allItems = getAllShopItems()
      const availableItems = allItems.filter(item => 
        !item.unlocked && !bonsai.ownedItems.includes(item.id)
      )
      
      if (availableItems.length >= 2) {
        // Give 2 random different items
        const shuffledItems = [...availableItems].sort(() => Math.random() - 0.5)
        const randomItems = shuffledItems.slice(0, 2)
        
        randomItems.forEach(item => {
          bonsai.ownedItems.push(item.id)
        })
        await bonsai.save()
        itemReward = randomItems
        rewardData.itemsEarned = randomItems.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image
        }))
        console.log(`🎁 Gave 2 random items: ${randomItems.map(item => item.name).join(', ')}`)
      } else if (availableItems.length === 1) {
        // Only 1 item available, give that + credits
        const randomItem = availableItems[0]
        bonsai.ownedItems.push(randomItem.id)
        await bonsai.save()
        itemReward = [randomItem]
        user.credits += 150 // Give half the credits since only 1 item
        totalCreditsEarned += 150
        rewardData.creditsEarned += 150
        rewardData.itemsEarned = [{
          id: randomItem.id,
          name: randomItem.name,
          image: randomItem.image
        }]
        console.log(`🎁 Gave 1 random item: ${randomItem.name} + 150 credits`)
      } else {
        // User owns all items, give 300 credits instead
        user.credits += 300
        totalCreditsEarned += 300
        rewardData.creditsEarned += 300
        console.log('🎁 User owns all items, gave 300 credits instead')
      }
    }
    
    // Save user changes
    await user.save()
    
    console.log(`✅ Course completion rewards processed: ${totalCreditsEarned} credits${itemReward ? ` + ${Array.isArray(itemReward) ? itemReward.map(item => item.name).join(', ') : itemReward.name}` : ''}`)
    
    return rewardData
    
  } catch (error) {
    console.error('❌ Error processing course completion rewards:', error)
    // Don't fail the course completion if rewards fail
    return null
  }
}