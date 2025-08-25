// app/api/users/[userId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import Bonsai from "@/models/Bonsai.js";
import Progress from "@/models/Progress.js";
import Certificate from "@/models/Certificate.js";
import Friend from "@/models/Friend.js";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { userId } = params;

        await connectDb();
        
        // Find the requested user (public profile data only)
        const user = await User.findById(userId, {
            name: 1,
            email: 1, // Keep email for verification but don't expose in response
            country: 1,
            icon: 1,
            banner: 1,
            createdAt: 1,
            role: 1,
            enrolledCourses: 1
        }).populate('bonsai');

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Prevent users from viewing their own profile through this endpoint
        if (user.email === session.user.email) {
            return NextResponse.json(
                { success: false, message: "Use /api/profile for your own profile" },
                { status: 400 }
            );
        }

        // Get user's progress records with course details
        const progressRecords = await Progress.find({ user: user._id })
            .populate({
                path: 'course',
                select: 'title level'
            });

        // Calculate learning statistics (public stats only)
        const completedCourses = progressRecords.filter(record => record.isCompleted).length;
        const totalLessonsCompleted = progressRecords.reduce((total, record) => {
            return total + record.lessonProgress.filter(lesson => lesson.isCompleted).length;
        }, 0);

        // Get user's certificates (public achievements)
        const certificates = await Certificate.find({ user: user._id })
            .select('courseTitle completionDate certificateId')
            .sort({ completionDate: -1 });

        // Get bonsai data
        const bonsai = user.bonsai || null;

        // Check friendship status between current user and profile user
        const friendStatus = await Friend.findOne({
            $or: [
                { requester: session.user.id, recipient: user._id },
                { requester: user._id, recipient: session.user.id }
            ]
        });

        // Prepare public profile response (no sensitive data)
        const publicUserData = {
            id: user._id,
            name: user.name,
            country: user.country,
            role: user.role,
            icon: user.icon,
            banner: user.banner,
            joinDate: user.createdAt,
            progress: {
                coursesCompleted: completedCourses,
                lessonsCompleted: totalLessonsCompleted,
                enrolledCourses: user.enrolledCourses.length
            },
            bonsai: bonsai ? {
                level: bonsai.level || 1,
                totalCredits: bonsai.totalCredits || 0,
                customization: {
                    eyes: bonsai.customization?.eyes || 'default_eyes',
                    mouth: bonsai.customization?.mouth || 'default_mouth',
                    foliageColor: bonsai.customization?.foliageColor || '#77DD82',
                    potStyle: bonsai.customization?.potStyle || 'default_pot',
                    potColor: bonsai.customization?.potColor || '#FD9475',
                    groundStyle: bonsai.customization?.groundStyle || 'default_ground',
                    decorations: bonsai.customization?.decorations || []
                }
            } : {
                level: 1,
                totalCredits: 0,
                customization: {
                    eyes: 'default_eyes',
                    mouth: 'default_mouth',
                    foliageColor: '#77DD82',
                    potStyle: 'default_pot',
                    potColor: '#FD9475',
                    groundStyle: 'default_ground',
                    decorations: []
                }
            },
            friendStatus: friendStatus ? friendStatus.status : null
        };

        return NextResponse.json({
            success: true,
            user: publicUserData,
            certificates: certificates.map(cert => ({
                id: cert._id,
                courseTitle: cert.courseTitle,
                completionDate: cert.completionDate,
                certificateId: cert.certificateId
            }))
        });

    } catch (error) {
        console.error("User Profile API Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}