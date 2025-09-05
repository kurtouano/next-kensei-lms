// app/api/courses/[slug]/questions/[questionId]/comments/route.js - FIXED
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import Question from "@/models/Question";
import User from "@/models/User";
import Activity from "@/models/Activity";

// POST - Add a comment to a question
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

    const { slug, questionId } = await params;
    
    // FIXED: Handle empty or malformed request body
    let comment;
    try {
      const body = await request.json();
      comment = body.comment;
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: "Invalid request body. Please provide a valid comment." }, 
        { status: 400 }
      );
    }

    // Validate input
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment is required" }, 
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: "Comment must be 500 characters or less" }, 
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

    // Find the question
    const question = await Question.findOne({
      _id: questionId,
      courseId: course._id
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Check if user is the instructor
    const isInstructor = course.instructor.toString() === user._id.toString();

    // Add comment to question
    const newComment = {
      user: user._id,
      comment: comment.trim(),
      likedBy: [],
      likeCount: 0,
      isInstructorReply: isInstructor,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    question.comments.push(newComment);

    // Mark question as answered if instructor replied
    if (isInstructor) {
      question.isAnswered = true;
    }

    await question.save();

    // Create activity record if instructor replied
    if (isInstructor) {
      try {
        const replyActivity = new Activity({
          instructor: course.instructor,
          course: course._id,
          user: user._id,
          type: 'question_answered',
          metadata: {
            questionId: questionId,
            replyText: comment.trim()
          }
        });
        
        await replyActivity.save();
        console.log('✅ Question answer activity created for instructor dashboard');
      } catch (activityError) {
        console.error('Failed to create reply activity:', activityError);
      }
    }

    // Populate the user data for the response
    const populatedComment = await Question.findById(questionId)
      .populate({
        path: 'comments.user',
        select: 'name email icon',
        populate: {
          path: 'bonsai',
          select: 'level customization'
        }
      })
      .select('comments')
      .lean();

    const latestComment = populatedComment.comments[populatedComment.comments.length - 1];

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      commentId: newComment._id?.toString() || "new-comment",
      comment: {
        _id: latestComment._id.toString(),
        comment: latestComment.comment,
        likeCount: latestComment.likeCount || 0,
        likedBy: latestComment.likedBy || [],
        isLiked: false, // Will be set by frontend
        isInstructorReply: latestComment.isInstructorReply || false,
        createdAt: new Date(latestComment.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        user: {
          name: latestComment.user?.name || 'Anonymous',
          email: latestComment.user?.email || '',
          icon: latestComment.user?.icon || null,
          bonsai: latestComment.user?.bonsai || null
        }
      }
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { 
        error: "Failed to add comment",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}