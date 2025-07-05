// app/api/courses/featured/route.js
import { connectDb } from "@/lib/mongodb"
import Course from "@/models/Course"
import User from "@/models/User"
import Module from "@/models/Module"
import Lesson from "@/models/Lesson"

export async function GET() {
  try {
    await connectDb()

    // Fetch featured courses - top 3 by enrollment and rating
    const featuredCourses = await Course.find({ 
      isPublished: true 
    })
    .sort({ 
      enrolledStudents: -1,
      'ratingStats.averageRating': -1,
      'ratingStats.totalRatings': -1
    })
    .limit(3)
    .select('title slug shortDescription thumbnail level ratingStats modules')

    // Calculate additional data for each course
    const coursesWithStats = await Promise.all(
      featuredCourses.map(async (course) => {
        // Count total lessons across all modules
        const courseWithModules = await Course.findById(course._id)
          .populate({
            path: 'modules',
            populate: {
              path: 'lessons',
              select: 'title'
            }
          })

        const totalLessons = courseWithModules?.modules?.reduce((total, module) => {
          return total + (module.lessons?.length || 0)
        }, 0) || 0

        return {
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          description: course.shortDescription,
          thumbnail: course.thumbnail,
          level: course.level,
          averageRating: course.ratingStats?.averageRating || 0,
          totalRatings: course.ratingStats?.totalRatings || 0,
          modulesCount: course.modules?.length || 0,
          lessonsCount: totalLessons,
          // Generate learning highlights based on level
          highlights: generateHighlights(course.level)
        }
      })
    )

    return Response.json({
      success: true,
      courses: coursesWithStats
    })

  } catch (error) {
    console.error('Error fetching featured courses:', error)
    return Response.json(
      { 
        success: false, 
        message: 'Failed to fetch featured courses',
        error: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to generate highlights based on JLPT level
function generateHighlights(level) {
  const highlights = {
    'N5': [
      'Basic Hiragana and Katakana',
      'Essential daily vocabulary',
      'Simple grammar patterns',
      'Basic conversation skills'
    ],
    'N4': [
      'Intermediate grammar structures',
      'Expanded vocabulary range',
      'Past and present tense mastery',
      'Cultural context understanding'
    ],
    'N3': [
      'Complex sentence structures',
      'Business-level vocabulary',
      'Kanji reading proficiency',
      'Advanced conversation skills'
    ],
    'N2': [
      'Advanced grammar patterns',
      'Professional communication',
      'News and media comprehension',
      'Cultural nuance understanding'
    ],
    'N1': [
      'Native-level expression',
      'Academic and business fluency',
      'Complex text comprehension',
      'Sophisticated conversation'
    ]
  }

  return highlights[level] || [
    'Interactive lessons',
    'Cultural insights',
    'Practical vocabulary',
    'Comprehensive exercises'
  ]
}