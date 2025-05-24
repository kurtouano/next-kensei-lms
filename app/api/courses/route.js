import { NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Course from "@/models/Course"
import Module from "@/models/Module"

export async function GET() {
  await connectDb()

  try {
    const courses = await Course.find({ isPublished: true })
      .select(
        "slug title shortDescription price creditReward itemsReward modules totalModules totalLessons enrolledStudents averageRating tags level category thumbnail instructorName highlights"
      )
      .lean()

    const formattedCourses = courses.map((course) => {
      return {
        id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        description: course.shortDescription,
        price: course.price,
        credits: course.creditReward,
        customItems: course.itemsReward.map((item) => item.item),
        modules: course.totalModules,
        lessons: course.totalLessons,
        level: course.level,
        category: course.category,
        thumbnail: course.thumbnail,
        highlights: course.highlights.map((h) => h.description),
        instructorName: course.instructorName,
      }
    })

    return NextResponse.json({ courses: formattedCourses })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
