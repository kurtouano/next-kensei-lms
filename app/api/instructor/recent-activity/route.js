// app/api/instructor/recent-activity/route.js - UPDATED with question_asked handling
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Activity from "@/models/Activity";

export async function GET(req) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Fetch recent activities for this instructor
    const activities = await Activity.find({ 
      instructor: session.user.id 
    })
    .populate({
      path: 'user',
      select: 'name email image icon profilePicture avatar' // Get all possible avatar fields
    })
    .populate({
      path: 'course',
      select: 'title slug thumbnail'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean();

    // Format activities for frontend
    const formattedActivities = activities.map(activity => {
      // Better avatar handling - check multiple possible fields
      const getUserAvatar = (user) => {
        return user?.image || user?.avatar || user?.profilePicture || user?.icon || null;
      };

      const baseActivity = {
        id: activity._id.toString(),
        type: activity.type,
        createdAt: activity.createdAt,
        user: {
          name: activity.user?.name || 'Unknown User',
          email: activity.user?.email || '',
          avatar: getUserAvatar(activity.user)
        },
        course: {
          title: activity.course?.title || 'Unknown Course',
          slug: activity.course?.slug || '',
          thumbnail: activity.course?.thumbnail || null
        }
      };

      // Add type-specific data
      switch (activity.type) {
        case 'student_enrolled':
          return {
            ...baseActivity,
            message: `${baseActivity.user.name} enrolled in ${baseActivity.course.title}`,
            icon: 'user-plus',
            color: 'green',
            metadata: {
              price: activity.metadata?.enrollmentPrice || 0
            }
          };

        case 'course_rated':
          return {
            ...baseActivity,
            message: `${baseActivity.user.name} rated ${baseActivity.course.title}`,
            icon: 'star',
            color: 'yellow',
            metadata: {
              rating: activity.metadata?.rating || 0,
              reviewText: activity.metadata?.reviewText || ''
            }
          };

        case 'lesson_completed':
          return {
            ...baseActivity,
            message: `${baseActivity.user.name} completed "${activity.metadata?.lessonTitle}" in ${baseActivity.course.title}`,
            icon: 'check-circle',
            color: 'blue',
            metadata: {
              lessonTitle: activity.metadata?.lessonTitle || '',
              moduleTitle: activity.metadata?.moduleTitle || ''
            }
          };

        case 'course_completed':
          return {
            ...baseActivity,
            message: `${baseActivity.user.name} completed the entire course: ${baseActivity.course.title}`,
            icon: 'trophy',
            color: 'purple',
            metadata: {
              completionPercentage: activity.metadata?.completionPercentage || 100,
              totalLessons: activity.metadata?.totalLessons || 0
            }
          };

        case 'course_liked':
          return {
            ...baseActivity,
            message: `${baseActivity.user.name} liked ${baseActivity.course.title}`,
            icon: 'heart',
            color: 'red'
          };

        // NEW: Handle question asked activity
        case 'question_asked':
          return {
            ...baseActivity,
            message: `${baseActivity.user.name} asked a question in ${baseActivity.course.title}`,
            icon: 'message-circle',
            color: 'indigo',
            metadata: {
              questionText: activity.metadata?.questionText || 'Question content not available',
              questionId: activity.metadata?.questionId || null
            }
          };

        default:
          return {
            ...baseActivity,
            message: `${baseActivity.user.name} performed an action on ${baseActivity.course.title}`,
            icon: 'activity',
            color: 'gray'
          };
      }
    });

    // Get total count for pagination
    const totalCount = await Activity.countDocuments({ 
      instructor: session.user.id 
    });

    // Calculate time groups
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groupedActivities = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    formattedActivities.forEach(activity => {
      const activityDate = new Date(activity.createdAt);
      
      if (activityDate >= today) {
        groupedActivities.today.push(activity);
      } else if (activityDate >= yesterday) {
        groupedActivities.yesterday.push(activity);
      } else if (activityDate >= lastWeek) {
        groupedActivities.thisWeek.push(activity);
      } else {
        groupedActivities.older.push(activity);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        activities: formattedActivities,
        groupedActivities,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Recent activity API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}