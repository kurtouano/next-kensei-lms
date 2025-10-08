import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Friend from "@/models/Friend";
import Notification from "@/models/Notification";
import { handleFriendAcceptance } from "@/lib/friendChatIntegration";
import sseManager from "@/lib/sseManager";
import User from "@/models/User";
import pusher from "@/lib/pusher";

// Helper function to get friends list
async function getFriendsList(userId) {
  const friendRelationships = await Friend.find({
    $or: [
      { requester: userId, status: 'accepted' },
      { recipient: userId, status: 'accepted' }
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

  const friends = friendRelationships.map(relationship => {
    const friend = relationship.requester._id.toString() === userId 
      ? relationship.recipient 
      : relationship.requester;

    // Determine online status (online if last seen within 2 minutes)
    const lastSeen = friend.lastSeen ? new Date(friend.lastSeen) : 
                    friend.lastLogin ? new Date(friend.lastLogin) : null;
    const now = new Date();
    const isOnline = lastSeen && (now - lastSeen) < 2 * 60 * 1000; // 2 minutes

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
  return friends.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return a.name.localeCompare(b.name);
  });
}

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

    // Send real-time notification via SSE
    sseManager.sendFriendAcceptedNotification(friendRequest.requester._id, session.user.name || 'Someone');

    // Update notification count for requester
    try {
      const notificationCount = await Notification.countDocuments({
        recipient: friendRequest.requester._id,
        read: false
      });
      sseManager.sendNotificationCountUpdate(friendRequest.requester._id, notificationCount);
      
      // ALSO send via Pusher for real-time header updates
      await pusher.trigger(`user-${friendRequest.requester._id.toString()}`, 'notification-count', {
        count: notificationCount
      });
      console.log(`[Pusher] Sent notification count to user-${friendRequest.requester._id.toString()}:`, notificationCount);
    } catch (error) {
      console.error('Error updating notification count:', error);
    }

    // If friend request was accepted, create a direct chat between the users
    let chatResult = null;
    if (action === 'accept') {
      try {
        chatResult = await handleFriendAcceptance(
          friendRequest.requester._id, 
          session.user.id
        );

        // Send updated friends list to both users
        const [requesterFriends, responderFriends] = await Promise.all([
          getFriendsList(friendRequest.requester._id),
          getFriendsList(session.user.id)
        ]);

        sseManager.sendFriendsUpdate(friendRequest.requester._id, requesterFriends);
        sseManager.sendFriendsUpdate(session.user.id, responderFriends);

        // Send online friends count update to both users
        const requesterOnlineCount = requesterFriends.filter(friend => friend.isOnline).length;
        const responderOnlineCount = responderFriends.filter(friend => friend.isOnline).length;
        
        sseManager.sendToUser(friendRequest.requester._id, {
          type: 'online_friends_count_update',
          count: requesterOnlineCount,
          timestamp: new Date().toISOString()
        });
        
        sseManager.sendToUser(session.user.id, {
          type: 'online_friends_count_update',
          count: responderOnlineCount,
          timestamp: new Date().toISOString()
        });
        
        // ALSO send via Pusher for real-time header updates
        try {
          await pusher.trigger(`user-${friendRequest.requester._id.toString()}`, 'online-friends-count', {
            count: requesterOnlineCount
          });
          console.log(`[Pusher] Sent online friends count to user-${friendRequest.requester._id.toString()}:`, requesterOnlineCount);
          
          await pusher.trigger(`user-${session.user.id}`, 'online-friends-count', {
            count: responderOnlineCount
          });
          console.log(`[Pusher] Sent online friends count to user-${session.user.id}:`, responderOnlineCount);
          
          // Trigger friends list update for both users
          await pusher.trigger(`user-${friendRequest.requester._id.toString()}`, 'friends-update', {
            timestamp: new Date().toISOString()
          });
          await pusher.trigger(`user-${session.user.id}`, 'friends-update', {
            timestamp: new Date().toISOString()
          });
          console.log(`[Pusher] Sent friends-update to both users`);
        } catch (pusherError) {
          console.error('Error sending Pusher online friends count:', pusherError);
        }

      } catch (error) {
        console.error("Failed to create friend chat:", error);
        // Don't fail the entire request if chat creation fails
        chatResult = { 
          success: false, 
          error: error.message,
          message: "Friend request accepted, but failed to create chat"
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: `Friend request ${action}ed successfully`,
      friendRequest: friendRequest,
      ...(chatResult && { chat: chatResult })
    });

  } catch (error) {
    console.error("Friend response error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process friend request" },
      { status: 500 }
    );
  }
}
