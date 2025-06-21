import User from "@/models/User";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

        // ✅ Get user with expanded course data
        const getUser = await User.findById(session.user.id)
            .populate({
                path: "publishedCourses",
                select: "_id title shortDescription thumbnail price isPublished enrolledStudents ratingStats createdAt updatedAt level category modules revenue",
                populate: {
                    path: "modules",
                    select: "lessons",
                    populate: {
                        path: "lessons",
                        select: "videoDuration"
                    }
                }
            })
            .lean();

        if (!getUser) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }

        if (getUser.publishedCourses.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No courses uploaded',
                data: {
                    user: {
                        id: getUser._id,
                        name: getUser.name,
                        email: getUser.email
                    },
                    courses: [],
                    stats: {
                        totalCourses: 0,
                        totalStudents: 0,
                        totalRevenue: 0,
                        averageRating: 0,
                        totalLessons: 0,
                        totalModules: 0
                    },
                    monthlyData: []
                }
            });
        }

        // ✅ Calculate detailed course statistics
        const coursesWithStats = getUser.publishedCourses.map(course => {
            // ✅ Use ratingStats instead of ratings array
            const avgRating = course.ratingStats?.averageRating || 0;
            const ratingCount = course.ratingStats?.totalRatings || 0;

            // Calculate total revenue for this course (use stored revenue if available)
            const revenue = course.revenue?.total || ((course.enrolledStudents || 0) * (course.price || 0));

            // Calculate total lessons count
            const totalLessons = course.modules?.reduce((total, module) => 
                total + (module.lessons?.length || 0), 0) || 0;

            // Calculate total duration
            const totalDuration = course.modules?.reduce((total, module) => 
                total + (module.lessons?.reduce((lessonTotal, lesson) => 
                    lessonTotal + (lesson.videoDuration || 0), 0) || 0), 0) || 0;

            return {
                id: course._id,
                title: course.title,
                description: course.shortDescription,
                thumbnail: course.thumbnail,
                price: course.price || 0,
                students: course.enrolledStudents || 0,
                revenue: revenue,
                rating: Number(avgRating.toFixed(1)), 
                ratingCount: ratingCount,             
                status: course.isPublished ? "Published" : "Draft",
                published: course.createdAt,
                lastUpdated: course.updatedAt,
                level: course.level,
                category: course.category,
                modulesCount: course.modules?.length || 0,
                lessonsCount: totalLessons,
                totalDuration: Math.round(totalDuration / 60),
                isPublished: course.isPublished,
                monthlyRevenue: course.revenue?.monthly || []
            };
        });

        // ✅ Generate monthly enrollment data from Progress collection
        const monthlyEnrollmentData = await generateMonthlyEnrollmentData(getUser.publishedCourses.map(c => c._id));

        // ✅ Calculate WEIGHTED average rating (fixed logic)
        const totalRatingPoints = coursesWithStats.reduce((sum, course) => 
            sum + (course.rating * course.ratingCount), 0);
        const totalRatingCount = coursesWithStats.reduce((sum, course) => 
            sum + course.ratingCount, 0);

        const overallAverageRating = totalRatingCount > 0 
            ? (totalRatingPoints / totalRatingCount).toFixed(1)
            : "0.0";

        // ✅ Calculate overall statistics
        const stats = {
            totalCourses: coursesWithStats.length,
            publishedCourses: coursesWithStats.filter(course => course.isPublished).length,
            draftCourses: coursesWithStats.filter(course => !course.isPublished).length,
            totalStudents: coursesWithStats.reduce((sum, course) => sum + course.students, 0),
            totalRevenue: coursesWithStats.reduce((sum, course) => sum + course.revenue, 0),
            averageRating: overallAverageRating,
            totalLessons: coursesWithStats.reduce((sum, course) => sum + course.lessonsCount, 0),
            totalModules: coursesWithStats.reduce((sum, course) => sum + course.modulesCount, 0)
        };

        // ✅ Sort courses by creation date (newest first)
        coursesWithStats.sort((a, b) => new Date(b.published) - new Date(a.published));

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: getUser._id,
                    name: getUser.name,
                    email: getUser.email,
                    role: getUser.role
                },
                courses: coursesWithStats,
                stats: stats,
                monthlyData: monthlyEnrollmentData
            }
        });
        
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
}

// ✅ Helper function to generate monthly enrollment data
async function generateMonthlyEnrollmentData(courseIds) {
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        
        // Get enrollments for this month from Progress collection
        const enrollments = await Progress.countDocuments({
            course: { $in: courseIds },
            enrolledAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        // Calculate revenue for this month (simplified - you might want to use actual transaction data)
        const progressRecords = await Progress.find({
            course: { $in: courseIds },
            enrolledAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }).populate('course', 'price').lean();

        const monthlyRevenue = progressRecords.reduce((sum, record) => 
            sum + (record.course?.price || 0), 0);

        monthlyData.push({
            month: startOfMonth.toLocaleDateString('en-US', { month: 'short' }), // FIXED: Just month name like "July"
            enrollments,
            revenue: monthlyRevenue,
            courses: courseIds.length
        });
    }
    
    return monthlyData;
}