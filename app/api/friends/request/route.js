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

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { success: false, message: "Recipient not found" },
        { status: 404 }
      );
    }

    // Prevent self-friending
    if (session.user.id === recipientId) {
      return NextResponse.json(
        { success: false, message: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    // Check if friend request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { requester: session.user.id, recipient: recipientId },
        { requester: recipientId, recipient: session.user.id }
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
      }
    }

    // Create friend request
    const friendRequest = new Friend({
      requester: session.user.id,
      recipient: recipientId,
      status: 'pending'
    });

    await friendRequest.save();

    // Create notification for recipient
    const notification = new Notification({
      recipient: recipientId,
      sender: session.user.id,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${session.user.name || 'Someone'} sent you a friend request`,
      relatedData: {
        friendRequestId: friendRequest._id,
        requesterId: session.user.id
      }
    });

    await notification.save();

    // Send real-time notification via SSE
    sseManager.sendFriendRequestNotification(recipientId, session.user.name || 'Someone');

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
