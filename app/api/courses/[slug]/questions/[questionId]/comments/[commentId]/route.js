// app/api/courses/[slug]/questions/[questionId]/comments/[commentId]/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import Question from "@/models/Question";
import User from "@/models/User";

// PUT - Update a comment
export async function PUT(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const { slug, questionId, commentId } = await params;
    const { comment } = await request.json();

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

    // Find the question and comment
    const question = await Question.findOne({
      _id: questionId,
      courseId: course._id
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const commentToUpdate = question.comments.id(commentId);
    if (!commentToUpdate) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user owns the comment
    if (commentToUpdate.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this comment" }, 
        { status: 403 }
      );
    }

    // Update the comment
    commentToUpdate.comment = comment.trim();
    commentToUpdate.updatedAt = new Date();

    await question.save();

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully"
    });

  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const { slug, questionId, commentId } = await params;

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

    // Find the question and comment
    const question = await Question.findOne({
      _id: questionId,
      courseId: course._id
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const commentToDelete = question.comments.id(commentId);
    if (!commentToDelete) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user owns the comment or is the instructor
    const isOwner = commentToDelete.user.toString() === user._id.toString();
    const isInstructor = course.instructor.toString() === user._id.toString();

    if (!isOwner && !isInstructor) {
      return NextResponse.json(
        { error: "You don't have permission to delete this comment" }, 
        { status: 403 }
      );
    }

    // Remove the comment
    question.comments.pull(commentId);

    // If this was the only instructor reply, mark question as unanswered
    if (commentToDelete.isInstructorReply) {
      const hasOtherInstructorReplies = question.comments.some(c => c.isInstructorReply);
      if (!hasOtherInstructorReplies) {
        question.isAnswered = false;
      }
    }

    await question.save();

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" }, 
      { status: 500 }
    );
  }
}