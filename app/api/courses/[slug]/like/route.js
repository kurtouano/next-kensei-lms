// app/api/courses/[slug]/like/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import User from "@/models/User";

// POST - Toggle like/unlike for a course
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

    // Check if user has already liked the course
    const hasLiked = course.likedBy.includes(user._id);

    if (hasLiked) {
      // Unlike the course
      course.likedBy.pull(user._id);
      course.likeCount = Math.max(0, course.likeCount - 1);
    } else {
      // Like the course
      course.likedBy.push(user._id);
      course.likeCount += 1;
    }

    await course.save();

    return NextResponse.json({
      success: true,
      isLiked: !hasLiked,
      likeCount: course.likeCount,
      message: hasLiked ? "Course unliked successfully" : "Course liked successfully"
    });

  } catch (error) {
    console.error("Error toggling course like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" }, 
      { status: 500 }
    );
  }
}

// GET - Get like status for a course
export async function GET(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    // Find the course by slug
    const course = await Course.findOne({ slug }).select('likedBy likeCount');
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let isLiked = false;
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        isLiked = course.likedBy.includes(user._id);
      }
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount: course.likeCount || 0
    });

  } catch (error) {
    console.error("Error fetching like status:", error);
    return NextResponse.json(
      { error: "Failed to fetch like status" }, 
      { status: 500 }
    );
  }
}