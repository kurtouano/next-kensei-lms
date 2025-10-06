import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDb } from '@/lib/mongodb';
import Friend from '@/models/Friend';
import User from '@/models/User';
import sseManager from '@/lib/sseManager';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Set up SSE headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    };

    const stream = new ReadableStream({
      start(controller) {
        const sendData = (data) => {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        };

        const fetchAndSendFriends = async () => {
          try {
            await connectDb();
            
            // Get user's friends
            const friends = await Friend.find({
              $or: [
                { requester: session.user.id, status: 'accepted' },
                { recipient: session.user.id, status: 'accepted' }
              ]
            }).populate([
              {
                path: 'requester',
                select: 'name icon bonsai lastSeen lastLogin',
                model: User
              },
              {
                path: 'recipient',
                select: 'name icon bonsai lastSeen lastLogin',
                model: User
              }
            ]);

            const friendsList = friends.map(friend => {
              const friendUser = friend.requester._id.toString() === session.user.id 
                ? friend.recipient 
                : friend.requester;

              // Determine online status (online if last seen within 1 minute)
              const lastSeen = friendUser.lastSeen ? new Date(friendUser.lastSeen) :
                              friendUser.lastLogin ? new Date(friendUser.lastLogin) : null;
              const now = new Date();
              const isOnline = lastSeen && (now - lastSeen) < 1 * 60 * 1000; // 1 minute

              return {
                id: friendUser._id,
                name: friendUser.name,
                icon: friendUser.icon,
                isOnline,
                lastSeen: friendUser.lastSeen,
                bonsai: friendUser.bonsai ? {
                  level: friendUser.bonsai.level || 1,
                  customization: friendUser.bonsai.customization || {}
                } : {
                  level: 1,
                  customization: {}
                }
              };
            });

            // Sort by online status first, then by name
            friendsList.sort((a, b) => {
              if (a.isOnline && !b.isOnline) return -1;
              if (!a.isOnline && b.isOnline) return 1;
              return a.name.localeCompare(b.name);
            });

            sendData({
              type: 'friends_update',
              friends: friendsList,
              timestamp: new Date().toISOString()
            });

            // Also send notification count update
            try {
              const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/count`, {
                headers: {
                  'Cookie': req.headers.get('cookie') || ''
                }
              });
              
              if (notificationResponse.ok) {
                const notificationData = await notificationResponse.json();
                if (notificationData.success) {
                  sendData({
                    type: 'notification_count_update',
                    count: notificationData.count,
                    timestamp: new Date().toISOString()
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching notification count in SSE:', error);
            }

            // Also send chat count update
            try {
              const chatResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/chats/unread-count`, {
                headers: {
                  'Cookie': req.headers.get('cookie') || ''
                }
              });
              
              if (chatResponse.ok) {
                const chatData = await chatResponse.json();
                if (chatData.success) {
                  sendData({
                    type: 'chat_count_update',
                    count: chatData.count,
                    timestamp: new Date().toISOString()
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching chat count in SSE:', error);
            }

          } catch (error) {
            console.error('Error fetching friends for SSE:', error);
            sendData({
              type: 'error',
              message: 'Failed to fetch friends',
              timestamp: new Date().toISOString()
            });
          }
        };

        // Register this connection with the SSE manager
        sseManager.addConnection(session.user.id, controller);

        // Send initial data
        fetchAndSendFriends();

        // Send updates every 2 minutes
        const intervalId = setInterval(fetchAndSendFriends, 120000);

        // Keep connection alive with heartbeat
        const heartbeatId = setInterval(() => {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
        }, 30000); // Every 30 seconds

        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          sseManager.removeConnection(session.user.id, controller);
          clearInterval(intervalId);
          clearInterval(heartbeatId);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers });

  } catch (error) {
    console.error('SSE Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
