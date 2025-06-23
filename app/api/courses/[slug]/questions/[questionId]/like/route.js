// app/api/courses/[slug]/questions/[questionId]/like/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import Question from "@/models/Question";
import User from "@/models/User";

// POST - Toggle like/unlike for a question
export async function POST(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please log in to like questions" }, 
        { status: 401 }
      );
    }

    const { slug, questionId } = await params;

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

    // Check if user has already liked the question
    const hasLiked = question.likedBy && question.likedBy.includes(user._id);

    if (hasLiked) {
      // Unlike the question
      question.likedBy.pull(user._id);
      question.likeCount = Math.max(0, question.likeCount - 1);
    } else {
      // Like the question
      if (!question.likedBy) question.likedBy = [];
      question.likedBy.push(user._id);
      question.likeCount = (question.likeCount || 0) + 1;
    }

    await question.save();

    return NextResponse.json({
      success: true,
      isLiked: !hasLiked,
      likeCount: question.likeCount,
      message: hasLiked ? "Question unliked" : "Question liked"
    });

  } catch (error) {
    console.error("Error toggling question like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" }, 
      { status: 500 }
    );
  }
}