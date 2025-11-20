// app/api/instructor/courses/[courseId]/unpublish/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDb } from '@/lib/mongodb';
import Course from '@/models/Course';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = params;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    await connectDb();

    // Find the course
    const course = await Course.findById(courseId).populate('instructor');

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is the instructor or admin
    const isInstructor = course.instructor._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to unpublish this course' },
        { status: 403 }
      );
    }

    // Unpublish the course
    course.isPublished = false;
    await course.save();

    return NextResponse.json({
      success: true,
      message: 'Course unpublished successfully',
      course: {
        id: course._id.toString(),
        title: course.title,
        isPublished: course.isPublished
      }
    });

  } catch (error) {
    console.error('Error unpublishing course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

