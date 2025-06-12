// app/api/my-learning/route.js
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import Lesson from '@/models/Lesson';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    await connectDb();

    // Find user with BOTH enrolledCourses AND progressRecords populated
    const user = await User.findOne({ email: session.user.email })
      .populate({
        path: 'enrolledCourses',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .populate('progressRecords'); // This was missing!

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create progress map using the populated progressRecords
    const progressMap = {};
    user.progressRecords.forEach(progress => {
      progressMap[progress.course.toString()] = progress;
    });

    // Build enrolled courses data
    const enrolledCourses = await Promise.all(
      user.enrolledCourses.map(async (course) => {
        const progress = progressMap[course._id.toString()];
        
        // Get total lessons from database
        const totalLessons = await Lesson.countDocuments({ 
          courseRef: course._id,
          isPublished: true
        });
        
        // If no published lessons, try all lessons
        const totalLessonsAll = totalLessons > 0 ? totalLessons : 
          await Lesson.countDocuments({ courseRef: course._id });
        
        // Calculate completed lessons from progress
        let completedLessons = 0;
        if (progress?.lessonProgress && progress.lessonProgress.length > 0) {
          completedLessons = progress.lessonProgress.filter(lp => 
            lp.isCompleted === true
          ).length;
        }
        
        console.log(`Course: ${course.title} - ${completedLessons}/${totalLessonsAll} lessons`);
        
        // Get last lesson info - just for display purposes
        let lastLesson = "Getting Started";
        
        if (progress?.lessonProgress && progress.lessonProgress.length > 0) {
          // Find what they should do next
          const incompleteLessons = progress.lessonProgress.filter(lp => !lp.isCompleted);
          
          if (incompleteLessons.length > 0) {
            // Show next lesson they need to complete
            const nextIncompleteLesson = await Lesson.findById(incompleteLessons[0].lesson)
              .select('title');
            
            if (nextIncompleteLesson) {
              lastLesson = `Next: ${nextIncompleteLesson.title}`;
            }
          } else {
            // All lessons completed - show the last completed lesson
            const lastCompletedProgress = progress.lessonProgress
              .filter(lp => lp.isCompleted)
              .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))[0];
            
            if (lastCompletedProgress) {
              const lastCompletedLesson = await Lesson.findById(lastCompletedProgress.lesson)
                .select('title');
              
              if (lastCompletedLesson) {
                lastLesson = `Completed: ${lastCompletedLesson.title}`;
              } else {
                lastLesson = "Course Completed";
              }
            }
          }
        }

        return {
          id: course._id.toString(),
          title: course.title,
          level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
          progress: progress?.courseProgress || 0,
          lastLesson: lastLesson,
          image: course.thumbnail,
          totalLessons: totalLessonsAll,
          completedLessons: completedLessons,
          instructor: course.instructor?.name || "Unknown Instructor",
          slug: course.slug
        };
      })
    );

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