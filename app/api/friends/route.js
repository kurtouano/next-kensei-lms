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

    await connectDb();

    // Get all accepted friend relationships for the current user
    const friendRelationships = await Friend.find({
      $or: [
        { requester: session.user.id, status: 'accepted' },
        { recipient: session.user.id, status: 'accepted' }
      ]
    }).populate([
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
    ]);

    // Extract friend data and determine online status
    const friends = friendRelationships.map(relationship => {
      const friend = relationship.requester._id.toString() === session.user.id 
        ? relationship.recipient 
        : relationship.requester;

      // Determine online status (online if last seen within 3 minutes)
      const lastSeen = friend.lastSeen ? new Date(friend.lastSeen) : 
                      friend.lastLogin ? new Date(friend.lastLogin) : null;
      const now = new Date();
      const isOnline = lastSeen && (now - lastSeen) < 3 * 60 * 1000; // 3 minutes

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

    // Sort friends: online first, then by name
    const sortedFriends = friends.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      friends: sortedFriends
    });

  } catch (error) {
    console.error("Friends API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
