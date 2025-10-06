import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Friend from "@/models/Friend";
import Notification from "@/models/Notification";
import User from "@/models/User";
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

    const { recipientId } = await req.json();
    
    if (!recipientId) {
      return NextResponse.json(
        { success: false, message: "Recipient ID is required" },
        { status: 400 }
      );
    }

    await connectDb();

    // Ensure IDs are strings for comparison
    const currentUserId = session.user.id.toString();
    const targetUserId = recipientId.toString();

    // Check if recipient exists
    const recipient = await User.findById(targetUserId);
    if (!recipient) {
      return NextResponse.json(
        { success: false, message: "Recipient not found" },
        { status: 404 }
      );
    }

    // Prevent self-friending
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { success: false, message: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    // Check if friend request already exists (check both directions)
    const existingRequest = await Friend.findOne({
      $or: [
        { requester: currentUserId, recipient: targetUserId },
        { requester: targetUserId, recipient: currentUserId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { success: false, message: "Friend request already pending" },
          { status: 400 }
        );
      } else if (existingRequest.status === 'accepted') {
        return NextResponse.json(
          { success: false, message: "Already friends" },
          { status: 400 }
        );
      } else if (existingRequest.status === 'rejected' || existingRequest.status === 'blocked') {
        // If rejected or blocked, update the existing request instead of creating new one
        existingRequest.status = 'pending';
        existingRequest.requester = currentUserId;
        existingRequest.recipient = targetUserId;
        await existingRequest.save();
        
        // Create notification for recipient
        const notification = new Notification({
          recipient: targetUserId,
          sender: currentUserId,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `${session.user.name || 'Someone'} sent you a friend request`,
          relatedData: {
            friendRequestId: existingRequest._id,
            requesterId: currentUserId
          }
        });

        await notification.save();

        // Send real-time notification via SSE
        sseManager.sendFriendRequestNotification(targetUserId, session.user.name || 'Someone');

        // Update notification count for recipient
        try {
          const notificationCount = await Notification.countDocuments({
            recipient: targetUserId,
            read: false
          });
          sseManager.sendNotificationCountUpdate(targetUserId, notificationCount);
        } catch (error) {
          console.error('Error updating notification count:', error);
        }

        return NextResponse.json({
          success: true,
          message: "Friend request sent successfully",
          friendRequest: existingRequest
        });
      }
    }

    // Create friend request
    const friendRequest = new Friend({
      requester: currentUserId,
      recipient: targetUserId,
      status: 'pending'
    });

    try {
      await friendRequest.save();
    } catch (saveError) {
      // Handle duplicate key error
      if (saveError.code === 11000) {
        console.error('Duplicate key error - request already exists:', saveError);
        return NextResponse.json(
          { success: false, message: "Friend request already exists" },
          { status: 400 }
        );
      }
      throw saveError; // Re-throw other errors
    }

    // Create notification for recipient
    const notification = new Notification({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${session.user.name || 'Someone'} sent you a friend request`,
      relatedData: {
        friendRequestId: friendRequest._id,
        requesterId: currentUserId
      }
    });

    await notification.save();

    // Send real-time notification via SSE
    sseManager.sendFriendRequestNotification(targetUserId, session.user.name || 'Someone');

    // Update notification count for recipient
    try {
      const notificationCount = await Notification.countDocuments({
        recipient: targetUserId,
        read: false
      });
      sseManager.sendNotificationCountUpdate(targetUserId, notificationCount);
    } catch (error) {
      console.error('Error updating notification count:', error);
    }

    return NextResponse.json({
      success: true,
      message: "Friend request sent successfully",
      friendRequest: friendRequest
    });

  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send friend request" },
      { status: 500 }
    );
  }
}
