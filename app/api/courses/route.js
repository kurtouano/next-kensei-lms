import { NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Course from "@/models/Course"
import Module from "@/models/Module"
import Lesson from "@/models/Lesson"
import ShopItem from "@/models/ShopItem"

export async function GET() {
  await connectDb()

  try {
    const courses = await Course.find({ isPublished: true })
      .populate({
        path: "modules",
        populate: {
          path: "lessons",
        },
      })
      .populate("itemsReward")
      .lean()

      const formattedCourses = courses.map((course) => {
      const totalModules = course.modules.length;
      const totalLessons = course.modules.reduce((acc, module) => {
        return acc + (module.lessons?.length || 0);
      }, 0);

      return {
        id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        description: course.shortDescription,
        price: course.price,
        credits: course.creditReward,
        itemsReward: course.itemsReward.map(item => item.name),
        modules: totalModules,
        lessons: totalLessons,
        // likes: totalLikes,
        level: course.level,
        category: course.category,
        thumbnail: course.thumbnail,
        highlights: course.highlights.map((h) => h.description),
        instructorName: course.instructorName,
      }
    });

    return NextResponse.json({ courses: formattedCourses })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
