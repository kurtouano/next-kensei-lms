// app/api/courses/[slug]/like/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import User from "@/models/User";
import Activity from "@/models/Activity";

// POST - Toggle like/unlike for a course
export async function POST(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false,
          error: "Please log in to like courses" 
        }, 
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Find the course by slug
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: "User not found" 
      }, { status: 404 });
    }

    // Check if user has already liked the course
    const hasLiked = course.likedBy && course.likedBy.includes(user._id);

    if (hasLiked) {
      // Unlike the course
      course.likedBy.pull(user._id);
      course.likeCount = Math.max(0, course.likeCount - 1);
      
      // ✅ NEW: Remove the like activity when unliking
      try {
        await Activity.findOneAndDelete({
          instructor: course.instructor,
          course: course._id,
          user: user._id,
          type: 'course_liked'
        });
        console.log('✅ Like activity removed from dashboard');
      } catch (activityError) {
        console.error('Failed to remove like activity:', activityError);
      }
      
    } else {
      // Like the course
      if (!course.likedBy) course.likedBy = [];
      course.likedBy.push(user._id);
      course.likeCount = (course.likeCount || 0) + 1;

      // ✅ IMPROVED: Check if activity already exists before creating
      try {
        const existingActivity = await Activity.findOne({
          instructor: course.instructor,
          course: course._id,
          user: user._id,
          type: 'course_liked'
        });

        if (!existingActivity) {
          const likeActivity = new Activity({
            instructor: course.instructor,
            course: course._id,
            user: user._id,
            type: 'course_liked'
          });
          
          await likeActivity.save();
          console.log('✅ Like activity created for instructor dashboard');
        } else {
          console.log('ℹ️ Like activity already exists, skipping creation');
        }
      } catch (activityError) {
        console.error('Failed to create like activity:', activityError);
        // Don't fail the like if activity creation fails
      }
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
      { 
        success: false,
        error: "Failed to toggle like" 
      }, 
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
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    let isLiked = false;

    // Check if user is authenticated and has liked the course
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        isLiked = course.likedBy && course.likedBy.includes(user._id);
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
      { 
        success: false,
        error: "Failed to fetch like status" 
      }, 
      { status: 500 }
    );
  }
}