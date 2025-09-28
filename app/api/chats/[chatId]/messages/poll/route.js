import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import ChatParticipant from "@/models/ChatParticipant"
import Message from "@/models/Message"
import User from "@/models/User"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId } = await params
    const { searchParams } = new URL(request.url)
    const since = searchParams.get("since") // ISO timestamp
    
    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify user is participant
    const participation = await ChatParticipant.findOne({
      chat: chatId,
      user: user._id,
      isActive: true,
    })

    if (!participation) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Build query for new messages
    const query = {
      chat: chatId,
      isDeleted: false,
    }

    // Only get messages after the specified timestamp
    if (since) {
      query.createdAt = { $gt: new Date(since) }
    }

    // Get new messages
    const newMessages = await Message.find(query)
      .populate({
        path: "sender",
        select: "name email icon bonsai",
        populate: {
          path: "bonsai",
          select: "level customization",
        },
      })
      .populate({
        path: "replyTo",
        select: "content sender type createdAt",
        populate: {
          path: "sender",
          select: "name email",
        },
      })
      .sort({ createdAt: 1 }) // Ascending order
      .limit(50) // Limit to prevent large responses

    const formattedMessages = newMessages.map((message) => ({
      id: message._id,
      content: message.content,
      type: message.type,
      sender: message.sender ? {
        id: message.sender._id,
        name: message.sender.name,
        email: message.sender.email,
        icon: message.sender.icon,
        bonsai: message.sender.bonsai,
      } : {
        id: '000000000000000000000000',
        name: 'System',
        email: 'system@kensei-lms.com',
        icon: null,
      },
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      replyTo: message.replyTo ? {
        id: message.replyTo._id,
        content: message.replyTo.content,
        sender: message.replyTo.sender?.name || "Unknown",
        type: message.replyTo.type,
        createdAt: message.replyTo.createdAt,
      } : null,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }))

    // Update user's last read timestamp if we found new messages
    if (formattedMessages.length > 0) {
      await ChatParticipant.findByIdAndUpdate(participation._id, {
        lastRead: new Date(),
        lastSeenMessage: formattedMessages[formattedMessages.length - 1].id,
      })
    }

    return NextResponse.json({
      success: true,
      newMessages: formattedMessages,
      count: formattedMessages.length,
      since: since || null,
    })

  } catch (error) {
    console.error("Error polling for new messages:", error)
    return NextResponse.json(
      { error: "Failed to poll messages" },
      { status: 500 }
    )
  }
}
