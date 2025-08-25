import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDb } from '@/lib/mongodb';
import Friend from '@/models/Friend';
import User from '@/models/User';

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

              // Determine online status (online if last seen within 3 minutes)
              const lastSeen = friendUser.lastSeen ? new Date(friendUser.lastSeen) :
                              friendUser.lastLogin ? new Date(friendUser.lastLogin) : null;
              const now = new Date();
              const isOnline = lastSeen && (now - lastSeen) < 3 * 60 * 1000; // 3 minutes

              return {
                _id: friendUser._id,
                name: friendUser.name,
                icon: friendUser.icon,
                bonsai: friendUser.bonsai,
                lastSeen: friendUser.lastSeen,
                lastLogin: friendUser.lastLogin,
                isOnline
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

          } catch (error) {
            console.error('Error fetching friends for SSE:', error);
            sendData({
              type: 'error',
              message: 'Failed to fetch friends',
              timestamp: new Date().toISOString()
            });
          }
        };

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
