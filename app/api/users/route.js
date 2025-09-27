// app/api/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { withDbOperation, formatApiError } from "@/lib/apiWrapper";
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

        // Use robust database operation wrapper
        const result = await withDbOperation(async () => {
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
            .limit(50) // Limit to 50 users for performance
            .skip(0) // Add pagination support later
            .lean(); // Use lean() for better performance

            const userIds = users.map(user => user._id);

            // OPTIMIZED: Get all certificate counts in one aggregation
            const certificateCounts = await Certificate.aggregate([
                { $match: { user: { $in: userIds } } },
                { $group: { _id: '$user', count: { $sum: 1 } } }
            ]);
            const certificateMap = {};
            certificateCounts.forEach(item => {
                certificateMap[item._id.toString()] = item.count;
            });

            // OPTIMIZED: Get all friend relationships in one query
            const friendRelationships = await Friend.find({
                $or: [
                    { requester: session.user.id, recipient: { $in: userIds } },
                    { requester: { $in: userIds }, recipient: session.user.id }
                ]
            }).lean();

            const friendMap = {};
            const acceptedFriends = [];
            friendRelationships.forEach(friend => {
                const otherUserId = friend.requester.toString() === session.user.id 
                    ? friend.recipient.toString() 
                    : friend.requester.toString();
                friendMap[otherUserId] = friend.status;
                if (friend.status === 'accepted') {
                    acceptedFriends.push(otherUserId);
                }
            });

            // OPTIMIZED: Get mutual friends count for accepted friends only
            const mutualFriendsMap = {};
            if (acceptedFriends.length > 0) {
                const mutualFriendsData = await Friend.aggregate([
                    {
                        $match: {
                            $or: [
                                { requester: session.user.id, recipient: { $in: acceptedFriends } },
                                { requester: { $in: acceptedFriends }, recipient: session.user.id }
                            ],
                            status: 'accepted'
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $cond: [
                                    { $eq: ['$requester', session.user.id] },
                                    '$recipient',
                                    '$requester'
                                ]
                            },
                            mutualCount: { $sum: 1 }
                        }
                    }
                ]);

                mutualFriendsData.forEach(item => {
                    mutualFriendsMap[item._id.toString()] = item.mutualCount;
                });
            }

            // Build the response with pre-fetched data
            const usersWithStats = users.map(user => ({
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
                certificateCount: certificateMap[user._id.toString()] || 0,
                friendStatus: friendMap[user._id.toString()] || null,
                mutualFriends: mutualFriendsMap[user._id.toString()] || 0
            }));

            return {
                success: true,
                users: usersWithStats
            };
        }, {
            maxRetries: 5,
            operationName: 'Fetch Users'
        });

        return NextResponse.json(result);

    } catch (error) {
        const errorResponse = formatApiError(error, 'Users API');
        const statusCode = error.message.includes('Unauthorized') ? 401 : 500;
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}