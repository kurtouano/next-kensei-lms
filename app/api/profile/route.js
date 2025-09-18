// app/api/profile/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import Bonsai from "@/models/Bonsai.js";
import Progress from "@/models/Progress.js";
import Module from "@/models/Module.js";
import Lesson from "@/models/Lesson.js";
import Course from "@/models/Course.js";
import Rating from "@/models/Rating.js";
import sseManager from "@/lib/sseManager";
import Friend from "@/models/Friend.js";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDb();
        
        // Find user with populated data
        const user = await User.findOne({ email: session.user.email })
            .populate('bonsai')
            .populate('enrolledCourses')
            .populate('publishedCourses')
            .populate('progressRecords');

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Get user's progress records with course details
        const progressRecords = await Progress.find({ user: user._id })
            .populate({
                path: 'course',
                select: 'title level thumbnail'
            })
            .populate('completedModules.module')
            .populate('lessonProgress.lesson');

        // Calculate learning statistics
        const completedCourses = progressRecords.filter(record => record.isCompleted).length;
        const totalLessonsCompleted = progressRecords.reduce((total, record) => {
            return total + record.lessonProgress.filter(lesson => lesson.isCompleted).length;
        }, 0);
        const totalQuizzesCompleted = progressRecords.reduce((total, record) => {
            return total + record.completedModules.length;
        }, 0);

        // Get user's certifications (completed courses) - remove duplicates
        const completedProgressRecords = progressRecords.filter(record => record.isCompleted);
        const uniqueCertifications = [];
        const seenCourses = new Set();
        
        completedProgressRecords.forEach(record => {
            const courseId = record.course._id.toString();
            if (!seenCourses.has(courseId)) {
                seenCourses.add(courseId);
                uniqueCertifications.push({
                    id: record.course._id,
                    title: record.course.title,
                    date: record.completedAt,
                    level: record.course.level
                });
            }
        });
        
        const certifications = uniqueCertifications;

        // Get bonsai data
        const bonsai = user.bonsai || null;

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                country: user.country,
                role: user.role,
                credits: user.credits,
                icon: user.icon,
                banner: user.banner, // Add banner field
                joinDate: user.createdAt,
                lastLogin: user.lastLogin,
                subscription: user.subscription,
                progress: {
                    coursesCompleted: completedCourses,
                    lessonsCompleted: totalLessonsCompleted,
                    quizzesCompleted: totalQuizzesCompleted,
                    enrolledCourses: user.enrolledCourses.length,
                    publishedCourses: user.publishedCourses.length
                },
                certifications: certifications,
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
                        decorations: bonsai.customization?.decorations || {}
                    },
                    ownedItems: bonsai.ownedItems || []
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
                        decorations: {}
                    },
                    ownedItems: []
                },
                enrolledCourses: user.enrolledCourses,
                progressRecords: progressRecords
            }
        });

    } catch (error) {
        console.error("Profile API Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const updateData = await req.json();
        await connectDb();

        // Build update object
        const updateFields = {
            name: updateData.name,
            country: updateData.country,
            icon: updateData.icon,
            updatedAt: new Date()
        };

        // Add banner if provided
        if (updateData.banner !== undefined) {
            updateFields.banner = updateData.banner;
        }

        // Find and update user
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateFields },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                country: user.country,
                icon: user.icon,
                banner: user.banner
            }
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const updateData = await req.json();
        await connectDb();

        // Build update object for lastSeen
        const updateFields = {};
        
        if (updateData.lastSeen) {
            updateFields.lastSeen = new Date(updateData.lastSeen);
        }

        // Find and update user
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateFields },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // If lastSeen was updated, notify friends about online status
        if (updateData.lastSeen) {
            try {
                // Get user's friends
                const friendRelationships = await Friend.find({
                    $or: [
                        { requester: user._id, status: 'accepted' },
                        { recipient: user._id, status: 'accepted' }
                    ]
                });

                // Extract friend IDs
                const friendIds = friendRelationships.map(relationship => 
                    relationship.requester.toString() === user._id.toString() 
                        ? relationship.recipient.toString()
                        : relationship.requester.toString()
                );

                // Send online status update to all friends
                if (friendIds.length > 0) {
                    sseManager.sendToUsers(friendIds, {
                        type: 'online_status_update',
                        userId: user._id.toString(),
                        isOnline: true,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error notifying friends of online status:', error);
                // Don't fail the request if notification fails
            }
        }

        return NextResponse.json({
            success: true,
            message: "Last seen updated successfully"
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}