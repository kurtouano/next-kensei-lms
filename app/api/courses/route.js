import { NextResponse } from "next/server"
import { connectDb } from "@/lib/mongodb"
import Course from "@/models/Course"
import Module from "@/models/Module"
import Lesson from "@/models/Lesson"

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

      .populate({
        path: "instructor",
        select: "name image icon email"
      })
      .lean()

    const formattedCourses = courses.map((course) => {
      const totalModules = course.modules?.length || 0;
      const totalLessons = course.modules?.reduce((acc, module) => {
        return acc + (module.lessons?.length || 0);
      }, 0) || 0;

      // Get rating statistics from ratingStats (your new system)
      const averageRating = course.ratingStats?.averageRating || 0;
      const totalReviews = course.ratingStats?.totalRatings || 0;
      const ratingDistribution = course.ratingStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      return {
        id: course._id.toString(),
        _id: course._id.toString(), // Some components might use _id
        slug: course.slug,
        title: course.title,
        description: course.shortDescription,
        shortDescription: course.shortDescription,
        fullDescription: course.fullDescription,
        price: course.price || 0,
        creditReward: course.creditReward || 0,
        credits: course.creditReward || 0, // Backward compatibility
        
        // Random reward flag
        randomReward: course.randomReward || false,
        
        // Course structure
        modules: totalModules,
        modulesCount: totalModules,
        lessons: totalLessons,
        lessonsCount: totalLessons,
        totalLessons: totalLessons,
        
        // Course metadata
        level: course.level,
        category: course.category,
        thumbnail: course.thumbnail,
        tags: course.tags || [],
        
        // Instructor info
        instructor: {
          name: course.instructor?.name || "Japanese Instructor",
          image: course.instructor?.image || course.instructor?.icon || null,
          email: course.instructor?.email || ""
        },
        
        // Highlights
        highlights: course.highlights?.map((h) => h.description || h) || [],
        
        // Rating system - provide both new and legacy format
        ratingStats: {
          averageRating: averageRating,
          totalRatings: totalReviews,
          distribution: ratingDistribution
        },
        averageRating: averageRating, // Legacy format
        totalReviews: totalReviews,   // Legacy format
        
        // Additional metadata
        enrolledStudents: course.enrolledStudents || 0,
        isPublished: course.isPublished !== false,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      }
    });

    // Sort courses by rating and then by enrollment
    const sortedCourses = formattedCourses.sort((a, b) => {
      // First sort by average rating (highest first)
      if (a.averageRating !== b.averageRating) {
        return b.averageRating - a.averageRating;
      }
      // Then by number of students (most popular first)
      if (a.enrolledStudents !== b.enrolledStudents) {
        return b.enrolledStudents - a.enrolledStudents;
      }
      // Finally by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return NextResponse.json({ 
      success: true,
      courses: sortedCourses,
      total: sortedCourses.length,
      message: "Courses fetched successfully"
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch courses",
        message: error.message,
        courses: []
      },
      { status: 500 }
    )
  }
}