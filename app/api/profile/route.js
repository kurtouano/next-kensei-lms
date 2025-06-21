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
                    level: bonsai.level,
                    totalCredits: bonsai.totalCredits,
                    tree: {
                        level: bonsai.tree.level,
                        type: bonsai.tree.type,
                        color: bonsai.tree.color
                    },
                    pot: {
                        type: bonsai.pot.type,
                        size: bonsai.pot.size
                    },
                    decoration: {
                        type: bonsai.decoration.type,
                        style: bonsai.decoration.style
                    }
                } : null,
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

        // Find and update user
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    name: updateData.name,
                    country: updateData.country,
                    icon: updateData.icon,
                    updatedAt: new Date()
                }
            },
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
                icon: user.icon
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