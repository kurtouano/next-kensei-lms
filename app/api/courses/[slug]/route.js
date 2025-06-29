// app/api/courses/[slug]/route.js - Fixed instructor authorization for preview mode
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Course from "@/models/Course";
import User from "@/models/User";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
  await connectDb();

  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const instructorPreview = url.searchParams.get('instructor-preview') === 'true';
    
    // 🔒 SECURITY: Get session for instructor verification
    const session = await getServerSession(authOptions);

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
        select: "name image icon email _id" // 🔧 ADDED: Include _id and email
      })
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 🔒 SECURITY: Verify instructor access if instructor-preview is requested
    let canAccessInstructorView = false;
    
    if (instructorPreview && session?.user) {
      console.log('🔍 Checking instructor access:', {
        userId: session.user.id,
        userEmail: session.user.email,
        userRole: session.user.role,
        courseInstructorId: course.instructor?._id?.toString(),
        courseInstructorEmail: course.instructor?.email,
        requestedPreview: instructorPreview
      });

      // Method 1: Check if user is admin (admins can preview any course)
      if (session.user.role === 'admin') {
        canAccessInstructorView = true;
        console.log('✅ Access granted: User is admin');
      }
      // Method 2: Check if user is instructor and owns this course
      else if (session.user.role === 'instructor') {
        const sessionUserId = session.user.id?.toString();
        const courseInstructorId = course.instructor?._id?.toString();
        
        // Check by ID comparison (most reliable)
        if (sessionUserId && courseInstructorId && sessionUserId === courseInstructorId) {
          canAccessInstructorView = true;
          console.log('✅ Access granted: User ID matches course instructor ID');
        }
        // Fallback: Check by email if ID comparison fails
        else if (session.user.email && course.instructor?.email && 
                 session.user.email === course.instructor.email) {
          canAccessInstructorView = true;
          console.log('✅ Access granted: Email matches course instructor email');
        }
        // Final fallback: Database lookup by email
        else if (session.user.email) {
          try {
            const user = await User.findOne({ email: session.user.email }).lean();
            
            if (user && user._id.toString() === courseInstructorId) {
              canAccessInstructorView = true;
              console.log('✅ Access granted: Database lookup confirmed ownership');
            } else {
              console.log('❌ Access denied: Database lookup failed or ID mismatch', {
                userIdFromDB: user?._id?.toString(),
                courseInstructorId: courseInstructorId
              });
            }
          } catch (error) {
            console.error('Error looking up user by email:', error);
          }
        }
      }
      
      if (!canAccessInstructorView) {
        console.log('❌ Access denied - Final check:', {
          userRole: session.user.role,
          sessionUserId: session.user.id,
          courseInstructorId: course.instructor?._id?.toString(),
          emailMatch: session.user.email === course.instructor?.email
        });
      }
    }

    // Calculate total duration and lessons
    let totalLessons = 0;
    let totalDurationSeconds = 0;

    course.modules.forEach(module => {
      if (module.lessons && Array.isArray(module.lessons)) {
        totalLessons += module.lessons.length;
        module.lessons.forEach(lesson => {
          // FIXED: Use videoDuration from your schema
          if (lesson.videoDuration) {
            // Assuming videoDuration is stored in seconds
            if (typeof lesson.videoDuration === 'number') {
              totalDurationSeconds += lesson.videoDuration;
            } else if (typeof lesson.videoDuration === 'string') {
              // Handle string format like "5:30" (minutes:seconds)
              if (lesson.videoDuration.includes(':')) {
                const [minutes, seconds] = lesson.videoDuration.split(':').map(Number);
                totalDurationSeconds += (minutes * 60) + seconds;
              } else {
                // Handle pure number as string
                totalDurationSeconds += parseInt(lesson.videoDuration) || 0;
              }
            }
          }
        });
      }
    });

    // Format total duration into hours and minutes
    const totalHours = Math.floor(totalDurationSeconds / 3600);
    const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
    
    let totalDuration;
    if (totalHours > 0) {
      totalDuration = `${totalHours}h ${totalMinutes}m`;
    } else {
      totalDuration = `${totalMinutes}m`;
    }

    // Helper function to format individual lesson duration
    const formatLessonDuration = (videoDuration) => {
      if (!videoDuration) return "0:00";
      
      let seconds = 0;
      if (typeof videoDuration === 'number') {
        seconds = videoDuration;
      } else if (typeof videoDuration === 'string') {
        if (videoDuration.includes(':')) {
          return videoDuration; // Already formatted
        } else {
          seconds = parseInt(videoDuration) || 0;
        }
      }
      
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formattedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.shortDescription,
      fullDescription: course.fullDescription,
      previewVideoUrl: course.previewVideoUrl,
      progress: 0,
      instructor: course.instructor?.name || "Japanese Instructor",
      instructorImg: course.instructor?.image || course.instructor?.icon || null,
      instructorId: course.instructor?._id?.toString(), // 🔧 ADDED: Include instructor ID
      lastUpdated: new Date(course.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      }),
      level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      totalDuration, // Properly calculated total duration
      totalLessons,
      price: course.price || 0,
      creditReward: course.creditReward || 0,
      enrolledStudents: course.enrolledStudents || 0,
      averageRating: course.ratingStats?.averageRating || 0,
      totalRatings: course.ratingStats?.totalRatings || 0,
      ratingDistribution: course.ratingStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      // 🔒 SECURITY: Add authorization info to response
      canAccessInstructorView,
      isInstructorPreview: instructorPreview && canAccessInstructorView,
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
          // FIXED: Use videoDuration and format it properly
          duration: formatLessonDuration(lesson.videoDuration),
          videoDuration: lesson.videoDuration, // Keep original for video player
          resources: lesson.resources || [],
        })),
        quiz: module.quiz && Array.isArray(module.quiz.questions)
          ? {
              title: module.quiz.title || `Module ${moduleIndex + 1} Quiz`,
              questions: module.quiz.questions.map((question) => {
                const baseQuestion = {
                  _id: question._id,
                  id: question._id,
                  type: question.type || "multiple_choice",
                  question: question.question,
                  points: question.points || 1,
                };

                switch (question.type) {
                  case "multiple_choice":
                    return {
                      ...baseQuestion,
                      options: question.options || [],
                      correctAnswer: question.options?.findIndex(opt => opt.isCorrect) || 0,
                    };

                  case "fill_in_blanks":
                    return {
                      ...baseQuestion,
                      blanks: question.blanks || [],
                    };

                  case "matching":
                    return {
                      ...baseQuestion,
                      pairs: question.pairs || [],
                    };

                  default:
                    return {
                      ...baseQuestion,
                      type: "multiple_choice",
                      options: question.options || [],
                      correctAnswer: question.options?.findIndex(opt => opt.isCorrect) || 0,
                    };
                }
              }),
            }
          : null,
      })),
    };

    return NextResponse.json({ 
      lessons: formattedCourse,
      // 🔒 SECURITY: Include authorization status in response
      meta: {
        canAccessInstructorView,
        isInstructorPreview: instructorPreview && canAccessInstructorView,
        requestedInstructorPreview: instructorPreview
      }
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: "Failed to fetch course data" }, { status: 500 });
  }
}