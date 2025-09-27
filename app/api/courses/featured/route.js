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

    // OPTIMIZED: Get all course data with modules and lessons in one query
    const courseIds = featuredCourses.map(course => course._id);
    
    const coursesWithModules = await Course.find({ _id: { $in: courseIds } })
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          select: 'title'
        }
      })
      .lean();

    // Create a map for quick lookup
    const courseModulesMap = {};
    coursesWithModules.forEach(course => {
      const totalLessons = course.modules?.reduce((total, module) => {
        return total + (module.lessons?.length || 0)
      }, 0) || 0;
      
      courseModulesMap[course._id.toString()] = {
        modulesCount: course.modules?.length || 0,
        lessonsCount: totalLessons
      };
    });

    // Build the response with pre-fetched data
    const coursesWithStats = featuredCourses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      description: course.shortDescription,
      thumbnail: course.thumbnail,
      level: course.level,
      averageRating: course.ratingStats?.averageRating || 0,
      totalRatings: course.ratingStats?.totalRatings || 0,
      modulesCount: courseModulesMap[course._id.toString()]?.modulesCount || 0,
      lessonsCount: courseModulesMap[course._id.toString()]?.lessonsCount || 0,
      // Generate learning highlights based on level
      highlights: generateHighlights(course.level)
    }))

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