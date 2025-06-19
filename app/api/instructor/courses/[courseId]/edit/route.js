// app/api/instructor/courses/[courseId]/edit/route.js
import Course from '@/models/Course'
import Module from '@/models/Module' 
import Lesson from '@/models/Lesson'
import User from '@/models/User'
import { connectDb } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const user = await User.findById(session.user.id)
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only instructors can edit courses' 
      }, { status: 403 })
    }

    const courseId = params.courseId

    // Find course with full module and lesson data
    const course = await Course.findById(courseId)
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          select: 'title order videoUrl videoDuration resources isPublished'
        }
      })
      .lean()

    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 })
    }

    // Check if user owns this course
    if (course.instructor.toString() !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You can only edit your own courses' 
      }, { status: 403 })
    }

    // Transform the data to match the frontend structure
    const courseData = {
      slug: course.slug,
      title: course.title,
      fullDescription: course.fullDescription,
      shortDescription: course.shortDescription,
      level: course.level,
      highlights: course.highlights && course.highlights.length > 0 
        ? course.highlights 
        : [{ description: "" }],
      thumbnail: course.thumbnail,
      previewVideoUrl: course.previewVideoUrl,
      price: course.price || 0,
      creditReward: course.creditReward || 0,
      itemsReward: course.itemsReward && course.itemsReward.length > 0 
        ? course.itemsReward 
        : [""],
      tags: course.tags && course.tags.length > 0 
        ? course.tags 
        : [""],
      isPublished: course.isPublished || false,
    }

    // Transform modules data
    const modules = course.modules.map(module => ({
      title: module.title,
      order: module.order,
      lessons: module.lessons.map(lesson => ({
        title: lesson.title,
        order: lesson.order,
        videoUrl: lesson.videoUrl,
        videoDuration: lesson.videoDuration || 0,
        resources: lesson.resources && lesson.resources.length > 0 
          ? lesson.resources 
          : [{ title: "", fileUrl: "" }],
        isPublished: lesson.isPublished || false,
      })),
      quiz: {
        title: module.quiz?.title || "",
        questions: module.quiz?.questions && module.quiz.questions.length > 0 
          ? module.quiz.questions.map(question => ({
              id: question.id || `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              question: question.question || "",
              type: question.type || "multiple_choice",
              points: question.points || 1,
              ...(question.type === "multiple_choice" && {
                options: question.options && question.options.length > 0 
                  ? question.options 
                  : [
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: true },
                    ]
              }),
              ...(question.type === "fill_in_blanks" && {
                blanks: question.blanks && question.blanks.length > 0 
                  ? question.blanks 
                  : [{ answer: "", alternatives: [""] }]
              }),
              ...(question.type === "matching" && {
                pairs: question.pairs && question.pairs.length > 0 
                  ? question.pairs 
                  : [
                      { left: "", right: "", points: 1 },
                      { left: "", right: "", points: 1 }
                    ]
              })
            }))
          : [{
              id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              question: "",
              type: "multiple_choice",
              points: 1,
              options: [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: true },
              ]
            }]
      }
    }))

    return NextResponse.json({ 
      success: true, 
      courseData,
      modules,
      courseId: course._id
    })
    
  } catch (error) {
    console.error('Course fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch course data' 
    }, { status: 500 })
  }
}

// PUT method for updating the course
export async function PUT(req, { params }) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const user = await User.findById(session.user.id)
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only instructors can edit courses' 
      }, { status: 403 })
    }

    const courseId = params.courseId
    const updateData = await req.json()
    const { modules: moduleData, ...courseInfo } = updateData

    // Find existing course
    const existingCourse = await Course.findById(courseId)
    if (!existingCourse) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 })
    }

    // Check ownership
    if (existingCourse.instructor.toString() !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You can only edit your own courses' 
      }, { status: 403 })
    }

    // Update course basic info
    Object.assign(existingCourse, {
      slug: courseInfo.slug,
      title: courseInfo.title,
      fullDescription: courseInfo.fullDescription,
      shortDescription: courseInfo.shortDescription,
      previewVideoUrl: courseInfo.previewVideoUrl,
      level: courseInfo.level,
      highlights: courseInfo.highlights || [],
      thumbnail: courseInfo.thumbnail,
      price: courseInfo.price || 0,
      creditReward: courseInfo.creditReward || 0,
      itemsReward: courseInfo.itemsReward || [],
      tags: courseInfo.tags || [],
      isPublished: courseInfo.isPublished || false,
    })

    // Delete existing modules and lessons
    const existingModules = await Module.find({ courseRef: courseId })
    for (const module of existingModules) {
      await Lesson.deleteMany({ moduleRef: module._id })
    }
    await Module.deleteMany({ courseRef: courseId })

    // Create new modules and lessons
    const moduleIds = []
    for (const moduleInfo of moduleData) {
      const { lessons: lessonData, ...moduleDetails } = moduleInfo

      const module = new Module({
        ...moduleDetails,
        courseRef: courseId,
        lessons: []
      })

      const savedModule = await module.save()
      moduleIds.push(savedModule._id)

      const lessonIds = []
      for (const lessonInfo of lessonData) {
        const lesson = new Lesson({
          ...lessonInfo,
          moduleRef: savedModule._id,
          courseRef: courseId
        })

        const savedLesson = await lesson.save()
        lessonIds.push(savedLesson._id)
      }

      savedModule.lessons = lessonIds
      await savedModule.save()
    }

    // Update course with new module IDs
    existingCourse.modules = moduleIds
    await existingCourse.save()

    return NextResponse.json({ 
      success: true, 
      course: existingCourse,
      message: 'Course updated successfully'
    })
    
  } catch (error) {
    console.error('Course update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to update course' 
    }, { status: 500 })
  }
}