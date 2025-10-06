import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import ChatParticipant from "@/models/ChatParticipant"
import Message from "@/models/Message"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    // Get all chats where user is a participant
    const userChats = await ChatParticipant.find({
      user: session.user.id,
      isActive: true
    }).populate('chat')

    const chatIds = userChats.map(participant => participant.chat._id)

    // Count unread messages (messages after user's lastRead timestamp)
    // Get the most recent lastRead timestamp from all user chats
    const lastReadTimestamps = userChats.map(p => {
      const lastRead = p.lastRead;
      if (!lastRead) return new Date(0); // If no lastRead, use epoch (all messages are unread)
      
      // Ensure it's a valid date
      const date = new Date(lastRead);
      return isNaN(date.getTime()) ? new Date(0) : date;
    });
    
    // Get the most recent valid lastRead timestamp
    const validTimestamps = lastReadTimestamps.filter(d => !isNaN(d.getTime()));
    const mostRecentLastRead = validTimestamps.length > 0 
      ? new Date(Math.max(...validTimestamps.map(d => d.getTime())))
      : new Date(0); // Fallback to epoch if no valid timestamps
    
    // Ensure the final date is valid
    const queryDate = isNaN(mostRecentLastRead.getTime()) ? new Date(0) : mostRecentLastRead;
    
    const unreadCount = await Message.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: session.user.id }, // Not sent by current user
      createdAt: {
        $gt: queryDate
      }
    })

    return NextResponse.json({
      success: true,
      count: unreadCount
    })

  } catch (error) {
    console.error("Error fetching unread chat count:", error)
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    )
  }
}
