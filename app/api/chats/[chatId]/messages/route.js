import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import Message from "@/models/Message"
import User from "@/models/User"
import { notifyNewMessage, formatMessageForBroadcast } from "@/lib/chatUtils"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page")) || 1
    const limit = parseInt(searchParams.get("limit")) || 20
    const skip = (page - 1) * limit

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify user is participant in this chat
    const participation = await ChatParticipant.findOne({
      chat: chatId,
      user: user._id,
      isActive: true,
    })

    if (!participation) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Build query for messages
    const query = {
      chat: chatId,
      isDeleted: false,
    }

    // Get total count for pagination
    const totalMessages = await Message.countDocuments(query)
    
    // Get messages with simple offset pagination (newest first, then reverse for display)
    const messages = await Message.find(query)
      .populate({
        path: "sender",
        select: "name email icon", // Removed bonsai populate for performance
      })
      .populate({
        path: "replyTo",
        select: "content sender type createdAt",
        populate: {
          path: "sender",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const hasMore = skip + messages.length < totalMessages

    // Reverse to show oldest first in the frontend
    const formattedMessages = messages.reverse().map((message) => ({
      id: message._id,
      content: message.content,
      type: message.type,
      sender: {
        id: message.sender._id,
        name: message.sender.name,
        email: message.sender.email,
        icon: message.sender.icon,
        // bonsai data will be loaded lazily when needed
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
      readBy: message.readBy || [],
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }))

    // Update user's last read timestamp (using reversed messages array)
    await ChatParticipant.findByIdAndUpdate(participation._id, {
      lastRead: new Date(),
      ...(formattedMessages.length > 0 && { lastSeenMessage: formattedMessages[formattedMessages.length - 1].id }),
    })

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        hasMore,
        currentPage: page,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        messagesPerPage: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId } = await params
    const { content, type = "text", attachments = [], replyTo } = await request.json()

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify user is participant in this chat
    const participation = await ChatParticipant.findOne({
      chat: chatId,
      user: user._id,
      isActive: true,
    })

    if (!participation) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Validate message content
    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message content or attachments required" }, { status: 400 })
    }

    // Create new message
    const message = new Message({
      chat: chatId,
      sender: user._id,
      content: content?.trim() || "",
      type,
      attachments,
      replyTo: replyTo || null,
    })

    await message.save()

    // Update chat's last activity and last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastActivity: new Date(),
    })

    // Populate the created message
    const populatedMessage = await Message.findById(message._id)
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

    const formattedMessage = {
      id: populatedMessage._id,
      content: populatedMessage.content,
      type: populatedMessage.type,
      sender: {
        id: populatedMessage.sender._id,
        name: populatedMessage.sender.name,
        email: populatedMessage.sender.email,
        icon: populatedMessage.sender.icon,
        bonsai: populatedMessage.sender.bonsai,
      },
      attachments: populatedMessage.attachments || [],
      reactions: populatedMessage.reactions || [],
      replyTo: populatedMessage.replyTo ? {
        id: populatedMessage.replyTo._id,
        content: populatedMessage.replyTo.content,
        sender: populatedMessage.replyTo.sender?.name || "Unknown",
        type: populatedMessage.replyTo.type,
        createdAt: populatedMessage.replyTo.createdAt,
      } : null,
      readBy: populatedMessage.readBy || [],
      isEdited: populatedMessage.isEdited,
      editedAt: populatedMessage.editedAt,
      createdAt: populatedMessage.createdAt,
      updatedAt: populatedMessage.updatedAt,
    }

    // Broadcast message to other participants in real-time
    await notifyNewMessage(chatId, formattedMessage, user._id)

    return NextResponse.json({
      success: true,
      message: formattedMessage,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
