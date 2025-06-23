// app/api/courses/[slug]/questions/[questionId]/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import Question from "@/models/Question";
import User from "@/models/User";
import Activity from "@/models/Activity";

// DELETE - Delete a question
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

    const { slug, questionId } = await params;

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

    // Find and verify ownership of the question
    const question = await Question.findOne({
      _id: questionId,
      courseId: course._id,
      user: user._id
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or you don't have permission to delete it" }, 
        { status: 404 }
      );
    }

    // Delete the question
    await Question.findByIdAndDelete(questionId);

    // Remove question activity
    try {
      await Activity.findOneAndDelete({
        instructor: course.instructor,
        course: course._id,
        user: user._id,
        type: 'question_asked'
      });
      console.log('✅ Question activity removed from dashboard');
    } catch (activityError) {
      console.error('Failed to remove question activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" }, 
      { status: 500 }
    );
  }
}