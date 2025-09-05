// app/api/courses/[slug]/questions/route.js - UPDATED with activity tracking
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Question from "@/models/Question"
import Course from "@/models/Course"
import User from "@/models/User"
import Activity from "@/models/Activity" // ADDED: Import Activity model

// GET - Fetch questions for a course (existing code)
export async function GET(request, { params }) {
  try {
    await connectDb()
    
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 5
    const skip = (page - 1) * limit

    // Find course by slug
    const course = await Course.findOne({ slug }).select('_id')
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: "Course not found" 
      }, { status: 404 })
    }

    // Get session for like status
    const session = await getServerSession(authOptions)
    const currentUser = session?.user?.email ? await User.findOne({ email: session.user.email }).select('_id') : null

    // Get total count
    const totalQuestions = await Question.countDocuments({ courseId: course._id })

    // Fetch questions with pagination
    const questions = await Question.find({ courseId: course._id })
      .populate({
        path: 'user',
        select: 'name email icon',
        populate: {
          path: 'bonsai',
          select: 'level customization'
        }
      })
      .populate({
        path: 'comments.user',
        select: 'name email icon',
        populate: {
          path: 'bonsai',
          select: 'level customization'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Format questions for frontend
    const formattedQuestions = questions.map(question => ({
      id: question._id.toString(),
      question: question.question,
      user: {
        name: question.user?.name || 'Anonymous',
        email: question.user?.email || '',
        icon: question.user?.icon || null,
        bonsai: question.user?.bonsai || null
      },
      likeCount: question.likeCount || 0,
      isLiked: currentUser ? question.likedBy?.includes(currentUser._id) || false : false,
      isAnswered: question.isAnswered || false,
      isPinned: question.isPinned || false,
      currentUserEmail: session?.user?.email || '',
      createdAt: question.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      comments: question.comments?.map(comment => ({
        _id: comment._id.toString(),
        comment: comment.comment,
        user: {
          name: comment.user?.name || 'Anonymous',
          email: comment.user?.email || '',
          icon: comment.user?.icon || null,
          bonsai: comment.user?.bonsai || null
        },
        likeCount: comment.likeCount || 0,
        isLiked: currentUser ? comment.likedBy?.includes(currentUser._id) || false : false,
        isInstructorReply: comment.isInstructorReply || false,
        currentUserEmail: session?.user?.email || '',
        createdAt: comment.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })) || []
    }))

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      totalQuestions,
      hasMore: skip + limit < totalQuestions
    })

  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch questions" 
    }, { status: 500 })
  }
}

// POST - Create a new question (UPDATED with activity tracking)
export async function POST(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    const { slug } = await params
    const { question } = await request.json()

    if (!question || !question.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Question text is required" 
      }, { status: 400 })
    }

    if (question.trim().length > 1000) {
      return NextResponse.json({ 
        success: false, 
        error: "Question cannot exceed 1000 characters" 
      }, { status: 400 })
    }

    // Find course by slug and populate instructor
    const course = await Course.findOne({ slug })
      .populate('instructor', '_id name email') // Get instructor details for activity
      .select('_id title instructor')
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: "Course not found" 
      }, { status: 404 })
    }

    // Find user
    const user = await User.findOne({ email: session.user.email }).select('_id name email')
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Create new question
    const newQuestion = new Question({
      courseId: course._id,
      user: user._id,
      question: question.trim()
    })

    await newQuestion.save()

    console.log('📝 Question created:', {
      questionId: newQuestion._id,
      userId: user._id,
      courseId: course._id,
      instructorId: course.instructor?._id,
      questionText: question.trim().substring(0, 50) + '...'
    })

    // NEW: Create activity for question asked
    try {
      if (course.instructor?._id) {
        // Create activity directly without static method
        const activity = new Activity({
          type: 'question_asked',
          user: user._id,
          course: course._id,
          instructor: course.instructor._id,
          metadata: {
            questionText: question.trim().length > 100 
              ? question.trim().substring(0, 100) + '...' 
              : question.trim(),
            questionId: newQuestion._id,
          }
        })
        
        await activity.save()
        console.log('✅ Question asked activity created successfully')
      } else {
        console.warn('⚠️ No instructor found for course, skipping activity creation')
      }
    } catch (activityError) {
      // Don't fail the question creation if activity creation fails
      console.error('❌ Failed to create question asked activity:', activityError)
    }

    return NextResponse.json({
      success: true,
      message: "Question posted successfully",
      question: {
        id: newQuestion._id.toString(),
        question: newQuestion.question,
        createdAt: newQuestion.createdAt
      }
    })

  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create question" 
    }, { status: 500 })
  }
}