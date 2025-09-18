import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Friend from "@/models/Friend";
import sseManager from "@/lib/sseManager";

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

    let cleanedCount = 0;

    // 1. Delete old read notifications (older than 7 days instead of 30)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedOldNotifications = await Notification.deleteMany({
      recipient: session.user.id,
      read: true,
      createdAt: { $lt: sevenDaysAgo }
    });

    cleanedCount += deletedOldNotifications.deletedCount;

    // 2. Mark processed friend request notifications as read
    const friendNotifications = await Notification.find({
      recipient: session.user.id,
      type: { $in: ['friend_request', 'friend_accepted', 'friend_rejected'] },
      read: false
    });

    for (const notification of friendNotifications) {
      const friendRequestId = notification.relatedData?.friendRequestId;
      
      if (friendRequestId) {
        const friendRequest = await Friend.findById(friendRequestId);
        
        // If the friend request exists and is processed (accepted or rejected), mark as read
        if (friendRequest && (friendRequest.status === 'accepted' || friendRequest.status === 'rejected')) {
          await Notification.findByIdAndUpdate(notification._id, { read: true });
          cleanedCount++;
        }
      }
    }

    // 3. Also mark old friend_accepted and friend_rejected notifications as read (older than 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const oldProcessedNotifications = await Notification.updateMany({
      recipient: session.user.id,
      type: { $in: ['friend_accepted', 'friend_rejected'] },
      read: false,
      createdAt: { $lt: threeDaysAgo }
    }, {
      read: true
    });

    cleanedCount += oldProcessedNotifications.modifiedCount;

    // 4. Delete very old notifications (older than 30 days) regardless of read status
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedVeryOldNotifications = await Notification.deleteMany({
      recipient: session.user.id,
      createdAt: { $lt: thirtyDaysAgo }
    });

    cleanedCount += deletedVeryOldNotifications.deletedCount;

    // 5. Update notification count for user
    try {
      const notificationCount = await Notification.countDocuments({
        recipient: session.user.id,
        read: false
      });
      sseManager.sendNotificationCountUpdate(session.user.id, notificationCount);
    } catch (error) {
      console.error('Error updating notification count:', error);
    }

    // Get some stats for debugging
    const totalNotifications = await Notification.countDocuments({
      recipient: session.user.id
    });
    
    const unreadNotifications = await Notification.countDocuments({
      recipient: session.user.id,
      read: false
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} notifications`,
      cleanedCount,
      stats: {
        totalNotifications,
        unreadNotifications,
        deletedOldRead: deletedOldNotifications.deletedCount,
        markedProcessed: cleanedCount - deletedOldNotifications.deletedCount - deletedVeryOldNotifications.deletedCount,
        deletedVeryOld: deletedVeryOldNotifications.deletedCount
      }
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cleanup notifications" },
      { status: 500 }
    );
  }
}
