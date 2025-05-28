import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";

export async function GET(request, { params }) {
  await connectDb();

  try {
    const { slug } = await params;

    const course = await Course.findOne( {slug})
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons quiz',
          model: 'Lesson', // or adapt this to populate quiz correctly
        },
      })
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const formattedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.shortDescription,
      fullDescription: course.fullDescription,
      progress: 0,
      instructor: {
        name: course.instructorName,
        avatar: "/placeholder.svg",
        title: "Japanese Language Instructor",
      },
      lastUpdated: new Date(course.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      }),
      totalLessons: course.totalLessons,
      level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
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
