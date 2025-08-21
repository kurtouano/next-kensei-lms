// app/api/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User";
import Certificate from "@/models/Certificate";
import Friend from "@/models/Friend";

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
        .populate('bonsai', 'level totalCredits customization')
        .sort({ createdAt: -1 }) // Newest users first
        .limit(50); // Limit to 50 users for performance

        // Get certificate counts and friend status for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const certificateCount = await Certificate.countDocuments({ user: user._id });
                
                // Get friend status between current user and this user
                const friendStatus = await Friend.findOne({
                    $or: [
                        { requester: session.user.id, recipient: user._id },
                        { requester: user._id, recipient: session.user.id }
                    ]
                });

                // Calculate mutual friends count
                let mutualFriends = 0;
                if (friendStatus && friendStatus.status === 'accepted') {
                    mutualFriends = await Friend.getMutualFriendsCount(session.user.id, user._id.toString());
                }
                
                return {
                    id: user._id,
                    name: user.name,
                    country: user.country,
                    icon: user.icon,
                    joinDate: user.createdAt,
                    role: user.role,
                    bonsai: user.bonsai ? {
                        level: user.bonsai.level || 1,
                        totalCredits: user.bonsai.totalCredits || 0,
                        customization: user.bonsai.customization || {}
                    } : {
                        level: 1,
                        totalCredits: 0,
                        customization: {}
                    },
                    certificateCount,
                    friendStatus: friendStatus ? friendStatus.status : null,
                    mutualFriends
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