import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Friend from "@/models/Friend";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    await connectDb();

    // Build search query for friends
    const friendQuery = {
      $or: [
        { requester: session.user.id, status: 'accepted' },
        { recipient: session.user.id, status: 'accepted' }
      ]
    };

    // Get total count for pagination
    const totalFriends = await Friend.countDocuments(friendQuery);

    // Get paginated friend relationships
    const friendRelationships = await Friend.find(friendQuery)
      .populate([
      {
        path: 'requester',
        select: 'name icon bonsai lastSeen lastLogin',
        populate: {
          path: 'bonsai',
          select: 'level customization'
        }
      },
      {
        path: 'recipient',
        select: 'name icon bonsai lastSeen lastLogin',
        populate: {
          path: 'bonsai',
          select: 'level customization'
        }
      }
    ])
    .sort({ createdAt: -1 }) // Newest friendships first
    .limit(limit)
    .skip(skip);

    // Extract friend data and determine online status
    let friends = friendRelationships.map(relationship => {
      const friend = relationship.requester._id.toString() === session.user.id 
        ? relationship.recipient 
        : relationship.requester;

      // Determine online status (online if last seen within 1 minute)
      const lastSeen = friend.lastSeen ? new Date(friend.lastSeen) : 
                      friend.lastLogin ? new Date(friend.lastLogin) : null;
      const now = new Date();
      const isOnline = lastSeen && (now - lastSeen) < 1 * 60 * 1000; // 1 minute

      return {
        id: friend._id,
        name: friend.name,
        icon: friend.icon,
        isOnline,
        lastSeen: friend.lastSeen,
        bonsai: friend.bonsai ? {
          level: friend.bonsai.level || 1,
          customization: friend.bonsai.customization || {}
        } : {
          level: 1,
          customization: {}
        }
      };
    });

    // Apply search filter if provided
    if (search.trim()) {
      friends = friends.filter(friend => 
        friend.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort friends: online first, then by name
    const sortedFriends = friends.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      friends: sortedFriends,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFriends / limit),
        totalFriends: totalFriends,
        hasMore: page < Math.ceil(totalFriends / limit),
        limit: limit
      }
    });

  } catch (error) {
    console.error("Friends API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
