// app/api/courses/[slug]/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Course from "@/models/Course";
import User from "@/models/User";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";

export async function GET(request, { params }) {
  await connectDb();

  try {
    const { slug } = await params;

    const course = await Course.findOne({ slug })
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons quiz',
          model: 'Lesson',
        },
      })
      .populate({
        path: 'instructor',
        select: "name image icon"
      })
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Calculate total duration and lessons
    let totalLessons = 0;
    let totalDurationMinutes = 0;

    course.modules.forEach(module => {
      if (module.lessons && Array.isArray(module.lessons)) {
        totalLessons += module.lessons.length;
        module.lessons.forEach(lesson => {
          if (lesson.duration) {
            // Assuming duration is stored in minutes or parse it if it's in "5:30" format
            if (typeof lesson.duration === 'string' && lesson.duration.includes(':')) {
              const [minutes, seconds] = lesson.duration.split(':').map(Number);
              totalDurationMinutes += minutes + (seconds / 60);
            } else if (typeof lesson.duration === 'number') {
              totalDurationMinutes += lesson.duration;
            }
          }
        });
      }
    });

    // Format total duration
    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = Math.round(totalDurationMinutes % 60);
    const totalDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const formattedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.shortDescription,
      fullDescription: course.fullDescription,
      // 🎥 Add preview video URL
      previewVideoUrl: course.previewVideoUrl,
      progress: 0,
      instructor: course.instructor?.name || "Japanese Instructor",
      instructorImg: course.instructor?.image || course.instructor?.icon || null,
      lastUpdated: new Date(course.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      }),
      level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      totalDuration,
      totalLessons,
      // 💰 Add pricing info
      price: course.price || 0,
      creditReward: course.creditReward || 0,
      enrolledStudents: course.enrolledStudents || 0,
      // Include rating stats from the course document
      averageRating: course.ratingStats?.averageRating || 0,
      totalRatings: course.ratingStats?.totalRatings || 0,
      ratingDistribution: course.ratingStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      modules: course.modules.map((module, moduleIndex) => ({
        id: module._id.toString(),
        title: module.title,
        items: module.lessons.map((lesson) => ({
          id: lesson._id.toString(),
          type: "video",
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          thumbnail: lesson.thumbnail,
          description: lesson.description,
          order: lesson.order,
          duration: lesson.duration || "5:00", // Default duration if not set
          resources: lesson.resources || [],
        })),
        quiz: module.quiz && Array.isArray(module.quiz.questions)
          ? {
              title: module.quiz.title || `Module ${moduleIndex + 1} Quiz`,
              questions: module.quiz.questions.map((question, qIndex) => ({
                id: qIndex + 1,
                question: question.question,
                options: question.options.map(opt => opt.text),
                correctAnswer: question.options.findIndex(opt => opt.isCorrect),
              })),
            }
          : null,
      })),
    };

    return NextResponse.json({ lessons: formattedCourse });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: "Failed to fetch course data" }, { status: 500 });
  }
}