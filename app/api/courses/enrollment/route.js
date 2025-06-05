// app/api/enrollment/check/route.js
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      // If user is not logged in, they're definitely not enrolled
      return NextResponse.json({
        success: true,
        isEnrolled: false,
        message: 'User not authenticated'
      });
    }

    // Connect to MongoDB
    await connectDb();

    // Find user and check if course is in their enrolled courses
    const user = await User.findOne({ 
      email: session.user.email,
      enrolledCourses: courseId 
    }).select('enrolledCourses');

    const isEnrolled = !!user; // User exists and has the course in enrolledCourses

    return NextResponse.json({
      success: true,
      isEnrolled: isEnrolled,
      message: isEnrolled ? 'User is enrolled in this course' : 'User is not enrolled in this course'
    });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { 
        success: false,
        isEnrolled: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}