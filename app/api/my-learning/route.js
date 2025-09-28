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
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    await connectDb();

    const user = await User.findOne({ email: session.user.email })
      .populate({
        path: 'enrolledCourses',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .populate('progressRecords');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const progressMap = {};
    user.progressRecords.forEach(progress => {
      progressMap[progress.course.toString()] = progress;
    });

    // OPTIMIZED: Get all lessons for all courses in one query
    const courseIds = user.enrolledCourses.map(course => course._id);
    const allLessons = await Lesson.find({ courseRef: { $in: courseIds } })
      .select('_id title courseRef')
      .lean();

    // Create a map for quick lookup
    const lessonsMap = {};
    allLessons.forEach(lesson => {
      const courseId = lesson.courseRef.toString();
      if (!lessonsMap[courseId]) {
        lessonsMap[courseId] = [];
      }
      lessonsMap[courseId].push(lesson);
    });

    const enrolledCourses = user.enrolledCourses.map(course => {
      const progress = progressMap[course._id.toString()];

      // Get lessons for this specific course
      const lessons = lessonsMap[course._id.toString()] || [];
      const totalLessons = lessons.length;

        // FIXED: Use the same logic as your course progress system
        // Count completed lessons from the lessonProgress array
        const completedLessons = progress?.lessonProgress
          ?.filter(lp => lp.lesson && lp.isCompleted)
          .length || 0;

        // Use the courseProgress directly from the progress record
        const courseProgress = progress?.courseProgress || 0;

        console.log('📊 My Learning Debug:', {
          courseId: course._id.toString(),
          courseTitle: course.title,
          totalLessons,
          completedLessons,
          courseProgress,
          lessonProgressCount: progress?.lessonProgress?.length || 0
        });

        // Determine last lesson (or next lesson)
        let lastLesson = "Getting Started";

        if (progress?.lessonProgress?.length > 0) {
          const incompleteLessons = progress.lessonProgress.filter(lp => lp.lesson && !lp.isCompleted);

          if (incompleteLessons.length > 0) {
            // Find the lesson in our pre-fetched lessons
            const nextLesson = lessons.find(l => l._id.toString() === incompleteLessons[0].lesson.toString());
            if (nextLesson) {
              lastLesson = `Next: ${nextLesson.title}`;
            }
          } else {
            const lastCompleted = progress.lessonProgress
              .filter(lp => lp.lesson && lp.isCompleted)
              .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))[0];

            if (lastCompleted) {
              // Find the lesson in our pre-fetched lessons
              const completedLesson = lessons.find(l => l._id.toString() === lastCompleted.lesson.toString());
              lastLesson = completedLesson?.title || "Course Completed";
            }
          }
        }

        return {
          id: course._id.toString(),
          title: course.title,
          level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
          progress: courseProgress, // Use the already calculated progress
          lastLesson,
          image: course.thumbnail,
          totalLessons,
          completedLessons,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    
  }
}