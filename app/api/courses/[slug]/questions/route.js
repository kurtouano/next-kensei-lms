// app/api/courses/[slug]/questions/route.js - Updated with pagination
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import Question from "@/models/Question";
import User from "@/models/User";
import Activity from "@/models/Activity";

// GET - Fetch questions for a course with pagination
export async function GET(request, { params }) {
  await connectDb();

  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // NEW: Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    // Find the course by slug
    const course = await Course.findOne({ slug }).lean();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // NEW: Get total count for pagination
    const totalQuestions = await Question.countDocuments({ courseId: course._id });

    // NEW: Calculate if there are more questions
    const hasMore = skip + limit < totalQuestions;

    // Fetch questions with pagination
    const questions = await Question.find({ courseId: course._id })
      .populate({
        path: 'user',
        select: 'name email icon'
      })
      .populate({
        path: 'comments.user',
        select: 'name email icon'
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format questions for frontend
    const formattedQuestions = questions.map(question => ({
      id: question._id.toString(),
      question: question.question,
      isAnswered: question.isAnswered || false,
      isPinned: question.isPinned || false,
      likeCount: question.likeCount || 0,
      likedBy: question.likedBy || [], // Include for frontend like status check
      viewCount: question.viewCount || 0,
      createdAt: new Date(question.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      user: {
        name: question.user?.name || "Anonymous",
        email: question.user?.email || "",
        avatar: question.user?.icon || null
      },
      comments: question.comments?.map(comment => ({
        _id: comment._id.toString(),
        comment: comment.comment,
        likeCount: comment.likeCount || 0,
        likedBy: comment.likedBy || [], // Include for frontend like status check
        isInstructorReply: comment.isInstructorReply || false,
        createdAt: new Date(comment.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        user: {
          name: comment.user?.name || "Anonymous",
          email: comment.user?.email || "",
          avatar: comment.user?.icon || null
        }
      })) || []
    }));

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      totalQuestions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / limit),
      hasMore, // NEW: Include hasMore flag
      limit
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" }, 
      { status: 500 }
    );
  }
}

// POST - Create a new question (unchanged)
export async function POST(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { question } = await request.json();

    // Validate input
    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question is required" }, 
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: "Question must be 1000 characters or less" }, 
        { status: 400 }
      );
    }

    // Find the course
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new question
    const newQuestion = new Question({
      courseId: course._id,
      user: user._id,
      question: question.trim(),
      isAnswered: false,
      isPinned: false,
      likedBy: [],
      likeCount: 0,
      comments: [],
      viewCount: 0
    });

    const savedQuestion = await newQuestion.save();

    // Create activity record for instructor dashboard
    try {
      const questionActivity = new Activity({
        instructor: course.instructor,
        course: course._id,
        user: user._id,
        type: 'question_asked',
        metadata: {
          questionText: question.trim()
        }
      });
      
      await questionActivity.save();
      console.log('✅ Question activity created for instructor dashboard');
    } catch (activityError) {
      console.error('Failed to create question activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      message: "Question posted successfully",
      questionId: savedQuestion._id.toString()
    });

  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to post question" }, 
      { status: 500 }
    );
  }
}