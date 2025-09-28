import Course from '@/models/Course'
import Module from '@/models/Module' 
import Lesson from '@/models/Lesson'
import User from '@/models/User'
import { connectDb } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const user = await User.findById(session.user.id)
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      return Response.json({ 
        success: false, 
        error: 'Only instructors can create courses' 
      }, { status: 403 })
    }

    const courseData = await req.json()
    const { modules: moduleData, ...courseInfo } = courseData

    // ✅ Fixed validation - removed category requirement
    if (!courseInfo.title || !courseInfo.shortDescription || !courseInfo.fullDescription || 
        !courseInfo.level || !courseInfo.thumbnail || !courseInfo.previewVideoUrl) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields. Please ensure all required fields including preview video are provided.' 
      }, { status: 400 })
    }

    // Create the course with all fields including previewVideoUrl
    const course = new Course({
      slug: courseInfo.slug,
      title: courseInfo.title,
      fullDescription: courseInfo.fullDescription,
      shortDescription: courseInfo.shortDescription,
      previewVideoUrl: courseInfo.previewVideoUrl,
      level: courseInfo.level,
      // ✅ Only include category if it exists in the data
      ...(courseInfo.category && { category: courseInfo.category }),
      highlights: courseInfo.highlights || [],
      thumbnail: courseInfo.thumbnail,
      instructor: session.user.id,
      price: courseInfo.price || 0,
      creditReward: courseInfo.creditReward || 0,
      randomReward: true, // Always enable random item rewards
      randomItemCount: courseInfo.randomItemCount || 2,
      tags: courseInfo.tags || [],
      isPublished: courseInfo.isPublished || false,
      modules: [] // Will be populated after module creation
    })

    const savedCourse = await course.save()

    // Update User's publishedCourses
    await User.findByIdAndUpdate(
      session.user.id,
      { 
        $addToSet: { publishedCourses: savedCourse._id }
      }
    )

    // Create modules and lessons
    const moduleIds = []

    for (const moduleInfo of moduleData) {
      const { lessons: lessonData, ...moduleDetails } = moduleInfo

      // Create the module first (no lessons yet)
      const module = new Module({
        ...moduleDetails,
        courseRef: savedCourse._id,
        lessons: [] // will be added later
      })

      const savedModule = await module.save()
      moduleIds.push(savedModule._id)

      // Now create lessons with moduleRef set
      const lessonIds = []

      for (const lessonInfo of lessonData) {
        const lesson = new Lesson({
          ...lessonInfo,
          moduleRef: savedModule._id,
          courseRef: savedCourse._id
        })

        const savedLesson = await lesson.save()
        lessonIds.push(savedLesson._id)
      }

      // Update module with its lessonIds
      savedModule.lessons = lessonIds
      await savedModule.save()
    }

    // Update course with module IDs
    savedCourse.modules = moduleIds
    await savedCourse.save()

    return Response.json({ 
      success: true, 
      course: savedCourse,
      message: 'Course created successfully with preview video'
    })
    
  } catch (error) {
    console.error('Course creation error:', error)
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message)
      return Response.json({ 
        success: false, 
        error: `Validation failed: ${errorMessages.join(', ')}` 
      }, { status: 400 })
    }

    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to create course' 
    }, { status: 500 })
  }
}