// app/api/my-learning/route.js
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDb();

    // Find user with enrolled courses populated
    const user = await User.findOne({ email: session.user.email })
      .populate({
        path: 'enrolledCourses',
        model: 'Course',
        populate: {
          path: 'instructor',
          model: 'User',
          select: 'name'
        }
      });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get progress records for all enrolled courses
    const progressRecords = await Progress.find({
      user: user._id,
      course: { $in: user.enrolledCourses.map(course => course._id) }
    });

    // Create a map for quick progress lookup
    const progressMap = {};
    progressRecords.forEach(progress => {
      progressMap[progress.course.toString()] = progress;
    });

    // Transform the data for the frontend
    const enrolledCourses = user.enrolledCourses.map(course => {
      const progress = progressMap[course._id.toString()];
      
      // Calculate total lessons from modules
      const totalLessons = course.modules?.length || 0;
      const completedLessons = progress?.lessonProgress?.filter(lp => lp.isCompleted).length || 0;
      const courseProgress = progress?.courseProgress || 0;
      
      // Get last lesson or default
      let lastLesson = "Getting Started";
      if (progress?.lessonProgress?.length > 0) {
        const lastLessonProgress = progress.lessonProgress
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
        if (lastLessonProgress) {
          lastLesson = "In Progress"; // You can populate lesson title if needed
        }
      }

      return {
        id: course._id.toString(),
        title: course.title,
        level: course.level.charAt(0).toUpperCase() + course.level.slice(1), // Capitalize first letter
        progress: courseProgress,
        lastLesson: lastLesson,
        image: course.thumbnail,
        totalLessons: totalLessons,
        completedLessons: completedLessons,
        instructor: course.instructor?.name || "Unknown Instructor",
        slug: course.slug
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        totalCourses: enrolledCourses.length
      },
      enrolledCourses
    });

  } catch (error) {
    console.error('Error fetching my learning data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}