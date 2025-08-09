// app/api/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import Certificate from "@/models/Certificate.js";

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
        
        // Get all users except the current user, with basic info only
        const users = await User.find(
            { email: { $ne: session.user.email } }, // Exclude current user
            {
                name: 1,
                email: 1,
                country: 1,
                icon: 1,
                createdAt: 1,
                role: 1
            }
        )
        .populate('bonsai', 'level totalCredits')
        .sort({ createdAt: -1 }) // Newest users first
        .limit(50); // Limit to 50 users for performance

        // Get certificate counts for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const certificateCount = await Certificate.countDocuments({ user: user._id });
                
                return {
                    id: user._id,
                    name: user.name,
                    country: user.country,
                    icon: user.icon,
                    joinDate: user.createdAt,
                    role: user.role,
                    bonsai: user.bonsai ? {
                        level: user.bonsai.level || 1,
                        totalCredits: user.bonsai.totalCredits || 0
                    } : {
                        level: 1,
                        totalCredits: 0
                    },
                    certificateCount
                };
            })
        );

        return NextResponse.json({
            success: true,
            users: usersWithStats
        });

    } catch (error) {
        console.error("Users API Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}