import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Friend from "@/models/Friend";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    // Find all friend-related notifications for the current user
    const friendNotifications = await Notification.find({
      recipient: session.user.id,
      type: { $in: ['friend_request', 'friend_accepted', 'friend_rejected'] }
    });

    let cleanedCount = 0;

    // Check each notification to see if it should be marked as read
    for (const notification of friendNotifications) {
      const friendRequestId = notification.relatedData?.friendRequestId;
      
      if (friendRequestId) {
        const friendRequest = await Friend.findById(friendRequestId);
        
        // If the friend request exists and is accepted, mark all related notifications as read
        if (friendRequest && friendRequest.status === 'accepted') {
          await Notification.findByIdAndUpdate(notification._id, { read: true });
          cleanedCount++;
        }
        // If the friend request is rejected, mark the notification as read
        else if (friendRequest && friendRequest.status === 'rejected') {
          await Notification.findByIdAndUpdate(notification._id, { read: true });
          cleanedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} notifications`,
      cleanedCount
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cleanup notifications" },
      { status: 500 }
    );
  }
}
