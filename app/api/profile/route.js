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
import { calculateBonsaiLevel, getLevelInfo } from "@/lib/levelCalculator";

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

        // Get bonsai data and calculate level
        let bonsai = user.bonsai || null;
        
        // If bonsai is not populated, fetch it directly
        if (!bonsai) {
            bonsai = await Bonsai.findOne({ userRef: user._id });
        }
        
        const levelInfo = getLevelInfo(user.lifetimeCredits || 0);

        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(), // Convert ObjectId to string
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
                    level: levelInfo.level,
                    totalCredits: user.lifetimeCredits || 0,
                    customization: {
                        eyes: bonsai.customization?.eyes || 'default_eyes',
                        mouth: bonsai.customization?.mouth || 'default_mouth',
                        foliageColor: bonsai.customization?.foliageColor || '#77DD82',
                        potStyle: bonsai.customization?.potStyle || 'default_pot',
                        potColor: bonsai.customization?.potColor || '#FD9475',
                        groundStyle: bonsai.customization?.groundStyle || 'default_ground',
                        hat: bonsai.customization?.hat || null,
                        background: bonsai.customization?.background || null
                    },
                    ownedItems: bonsai.ownedItems || []
                } : {
                    level: levelInfo.level,
                    totalCredits: user.lifetimeCredits || 0,
                    customization: {
                        eyes: 'default_eyes',
                        mouth: 'default_mouth',
                        foliageColor: '#77DD82',
                        potStyle: 'default_pot',
                        potColor: '#FD9475',
                        groundStyle: 'default_ground',
                        hat: null,
                        background: null
                    },
                    ownedItems: []
                },
                socialLinks: user.socialLinks || [],
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

        // Check if request has a body
        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { success: false, message: "Content-Type must be application/json" },
                { status: 400 }
            );
        }

        let updateData;
        try {
            updateData = await req.json();
        } catch (error) {
            console.error('JSON parsing error:', error);
            return NextResponse.json(
                { success: false, message: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

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
                }).populate([
                    { path: 'requester', select: 'lastSeen lastLogin' },
                    { path: 'recipient', select: 'lastSeen lastLogin' }
                ]);

                // Extract friend IDs
                const friendIds = friendRelationships.map(relationship => 
                    relationship.requester._id.toString() === user._id.toString() 
                        ? relationship.recipient._id.toString()
                        : relationship.requester._id.toString()
                );

                // Send online status update to all friends
                if (friendIds.length > 0) {
                    sseManager.sendToUsers(friendIds, {
                        type: 'online_status_update',
                        userId: user._id.toString(),
                        isOnline: true,
                        timestamp: new Date().toISOString()
                    });

                    // For each friend, calculate and send their updated online friends count
                    for (const friendId of friendIds) {
                        try {
                            // Get all friends for this specific friend
                            const theirFriends = await Friend.find({
                                $or: [
                                    { requester: friendId, status: 'accepted' },
                                    { recipient: friendId, status: 'accepted' }
                                ]
                            }).populate([
                                { path: 'requester', select: 'lastSeen lastLogin' },
                                { path: 'recipient', select: 'lastSeen lastLogin' }
                            ]);

                            // Count how many are online
                            const onlineCount = theirFriends.filter(relationship => {
                                const friendUser = relationship.requester._id.toString() === friendId 
                                    ? relationship.recipient 
                                    : relationship.requester;

                                const lastSeen = friendUser.lastSeen ? new Date(friendUser.lastSeen) :
                                                friendUser.lastLogin ? new Date(friendUser.lastLogin) : null;
                                const now = new Date();
                                return lastSeen && (now - lastSeen) < 1 * 60 * 1000; // 1 minute
                            }).length;

                            // Send updated count
                            sseManager.sendOnlineFriendsCountUpdate(friendId, onlineCount);
                        } catch (countError) {
                            console.error(`Error calculating online friends count for ${friendId}:`, countError);
                        }
                    }
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