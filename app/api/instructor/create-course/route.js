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

    // Create the course first
    const course = new Course({
      ...courseInfo,
       instructor: session.user.id,
       modules: []
    })

    const savedCourse = await course.save()

    // Update User's publishedCourses
    await User.findByIdAndUpdate(
      session.user.id,
      { 
        $addToSet: { publishedCourses: savedCourse._id } // Use $addToSet to avoid duplicates
      }
    )

    // Create modules and lessons
    const moduleIds = []

    for (const moduleInfo of moduleData) {
      const { lessons: lessonData, ...moduleDetails } = moduleInfo

      // ✅ Create the module first (no lessons yet)
      const module = new Module({
        ...moduleDetails,
        courseRef: savedCourse._id,
        lessons: [] // will be added later
      })

      const savedModule = await module.save()
      moduleIds.push(savedModule._id)

      // ✅ Now create lessons with moduleRef set
      const lessonIds = []

      for (const lessonInfo of lessonData) {
        const lesson = new Lesson({
          ...lessonInfo,
          moduleRef: savedModule._id, // correctly set moduleRef
          courseRef: savedCourse._id
        })

        const savedLesson = await lesson.save()
        lessonIds.push(savedLesson._id)
      }

      // ✅ Update module with its lessonIds
      savedModule.lessons = lessonIds
      await savedModule.save()
    }

    // Update course with module IDs
    savedCourse.modules = moduleIds
    await savedCourse.save()

    return Response.json({ 
      success: true, 
      course: savedCourse,
      message: 'Course created successfully'
    })
    
  } catch (error) {
    console.error('Course creation error:', error)
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to create course' 
    }, { status: 500 })
  }
}
