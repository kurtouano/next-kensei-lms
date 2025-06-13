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

    const enrolledCourses = await Promise.all(
      user.enrolledCourses.map(async (course) => {
        const progress = progressMap[course._id.toString()];

        // Get all lessons for the course (regardless of status)
        const lessons = await Lesson.find({ courseRef: course._id }).select('_id title');
        const totalLessons = lessons.length;

        // Filter out invalid lesson references before counting
        const completedLessons = progress?.lessonProgress
          ?.filter(lp => lp.lesson && lp.isCompleted)
          .map(lp => lp.lesson.toString()).filter(lessonId =>
            lessons.some(lesson => lesson._id.toString() === lessonId)
          ).length || 0;

        // Get percentage
        const courseProgress = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        // Determine last lesson (or next lesson)
        let lastLesson = "Getting Started";

        if (progress?.lessonProgress?.length > 0) {
          const incompleteLessons = progress.lessonProgress.filter(lp => lp.lesson && !lp.isCompleted);

          if (incompleteLessons.length > 0) {
            const nextLesson = await Lesson.findById(incompleteLessons[0].lesson).select('title');
            if (nextLesson) {
              lastLesson = `Next: ${nextLesson.title}`;
            }
          } else {
            const lastCompleted = progress.lessonProgress
              .filter(lp => lp.lesson && lp.isCompleted)
              .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))[0];

            if (lastCompleted) {
              const completedLesson = await Lesson.findById(lastCompleted.lesson).select('title');
              lastLesson = completedLesson?.title || "Course Completed";
            }
          }
        }

        return {
          id: course._id.toString(),
          title: course.title,
          level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
          progress: courseProgress,
          lastLesson,
          image: course.thumbnail,
          totalLessons,
          completedLessons,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
