// app/api/courses/[slug]/questions/[questionId]/comments/[commentId]/like/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import Question from "@/models/Question";
import User from "@/models/User";

// POST - Toggle like/unlike for a comment
export async function POST(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please log in to like comments" }, 
        { status: 401 }
      );
    }

    const { slug, questionId, commentId } = await params;

    // Find the course by slug
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

    // Find the comment
    const comment = question.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user has already liked the comment
    const hasLiked = comment.likedBy && comment.likedBy.includes(user._id);

    if (hasLiked) {
      // Unlike the comment
      comment.likedBy.pull(user._id);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      // Like the comment
      if (!comment.likedBy) comment.likedBy = [];
      comment.likedBy.push(user._id);
      comment.likeCount = (comment.likeCount || 0) + 1;
    }

    await question.save();

    return NextResponse.json({
      success: true,
      isLiked: !hasLiked,
      likeCount: comment.likeCount,
      message: hasLiked ? "Comment unliked" : "Comment liked"
    });

  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" }, 
      { status: 500 }
    );
  }
}