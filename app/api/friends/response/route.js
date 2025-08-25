import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Friend from "@/models/Friend";
import Notification from "@/models/Notification";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { friendRequestId, action } = await req.json();
    
    if (!friendRequestId || !action) {
      return NextResponse.json(
        { success: false, message: "Friend request ID and action are required" },
        { status: 400 }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    await connectDb();

    // Find the friend request and populate requester info
    const friendRequest = await Friend.findById(friendRequestId).populate('requester', 'name');
    
    if (!friendRequest) {
      return NextResponse.json(
        { success: false, message: "Friend request not found" },
        { status: 404 }
      );
    }

    // Check if the current user is the recipient
    if (friendRequest.recipient.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to respond to this request" },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      if (friendRequest.status === 'accepted') {
        return NextResponse.json(
          { success: true, message: "Friend request already accepted" },
          { status: 200 }
        );
      } else if (friendRequest.status === 'rejected') {
        return NextResponse.json(
          { success: false, message: "Friend request was already rejected" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Friend request is no longer pending" },
        { status: 400 }
      );
    }

    // Update friend request status
    friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await friendRequest.save();

    // Update the original friend request notification for the recipient to show the action taken
    await Notification.updateMany({
      recipient: session.user.id,
      type: 'friend_request',
      'relatedData.friendRequestId': friendRequest._id
    }, {
      type: action === 'accept' ? 'friend_accepted' : 'friend_rejected',
      title: action === 'accept' ? 'Friend Request Accepted' : 'Friend Request Declined',
      message: action === 'accept' 
        ? `You accepted ${friendRequest.requester.name || 'their'} friend request`
        : `You declined ${friendRequest.requester.name || 'their'} friend request`,
      read: true
    });

    // Create notification for the requester
    const notification = new Notification({
      recipient: friendRequest.requester,
      sender: session.user.id,
      type: action === 'accept' ? 'friend_accepted' : 'friend_rejected',
      title: action === 'accept' ? 'Friend Request Accepted' : 'Friend Request Declined',
      message: action === 'accept' 
        ? `${session.user.name || 'Someone'} accepted your friend request`
        : `${session.user.name || 'Someone'} declined your friend request`,
      relatedData: {
        friendRequestId: friendRequest._id,
        responderId: session.user.id
      }
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      message: `Friend request ${action}ed successfully`,
      friendRequest: friendRequest
    });

  } catch (error) {
    console.error("Friend response error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process friend request" },
      { status: 500 }
    );
  }
}
