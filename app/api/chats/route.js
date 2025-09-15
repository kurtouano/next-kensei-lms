import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import Message from "@/models/Message"
import User from "@/models/User"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page")) || 1
    const limit = parseInt(searchParams.get("limit")) || 15

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // First, get all active chat participations for the user
    const allParticipations = await ChatParticipant.find({
      user: user._id,
      isActive: true,
    })
      .populate({
        path: "chat",
        match: { isActive: true }, // Only populate active chats
        select: "name type avatar description createdBy lastMessage lastActivity participants participantCount isActive createdAt updatedAt", // Explicitly include avatar field
        populate: [
          {
            path: "lastMessage",
            populate: {
              path: "sender",
              select: "name email icon", // Removed bonsai populate
            },
          },
          {
            path: "participants",
            select: "name email icon lastSeen", // Removed bonsai populate
          },
        ],
      })

    // Filter out null chats and sort by lastActivity
    const validParticipations = allParticipations
      .filter((participation) => participation.chat) // Filter out null chats
      .sort((a, b) => new Date(b.chat.lastActivity) - new Date(a.chat.lastActivity))

    // Apply pagination to the filtered and sorted results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const participations = validParticipations.slice(startIndex, endIndex)


    // Format chats for frontend
    const chats = participations.map((participation) => {
        const chat = participation.chat
        
        // Initialize defaults
        let chatName = chat.name || "Chat"
        let chatAvatar = chat.avatar
        let otherParticipant = null

        // Debug: Log avatar info for group chats
        if (chat.type === "group") {
          console.log(`Group chat ${chat.name} avatar:`, chat.avatar)
        }

      // For direct chats, set name to the other participant's name
      if (chat.type === "direct") {
        otherParticipant = chat.participants.find(
          (p) => p._id.toString() !== user._id.toString()
        )
        chatName = otherParticipant?.name || "Unknown User"
        chatAvatar = otherParticipant?.icon === "bonsai" 
          ? "bonsai" 
          : otherParticipant?.icon || null
      }

      // Calculate unread count
      const unreadCount = 0 // Will implement this later with message counting

      return {
        id: chat._id,
        name: chatName,
        type: chat.type,
        avatar: chatAvatar,
        lastMessage: chat.lastMessage ? {
          content: chat.lastMessage.content,
          sender: chat.lastMessage.sender?.name || "Unknown",
          createdAt: chat.lastMessage.createdAt,
          type: chat.lastMessage.type,
        } : null,
        lastActivity: chat.lastActivity,
        unreadCount,
        participants: chat.participants.map(p => ({
          id: p._id,
          name: p.name,
          email: p.email,
          icon: p.icon,
        })),
        participantCount: chat.participants.length,
        isOnline: chat.type === "direct" ? 
          (otherParticipant?.lastSeen && 
           new Date() - new Date(otherParticipant.lastSeen) < 5 * 60 * 1000) : 
          false,
        participantData: participation,
      }
    })

    const totalChats = validParticipations.length

    return NextResponse.json({
      success: true,
      chats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalChats / limit),
        totalChats,
        hasMore: page * limit < totalChats,
      },
    })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { type, participantIds, name, description, avatar } = await request.json()

    // Find current user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate input
    if (!type || !["direct", "group"].includes(type)) {
      return NextResponse.json({ error: "Invalid chat type" }, { status: 400 })
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "Participants required" }, { status: 400 })
    }

    // For direct chats, ensure only 2 participants (current user + 1 other)
    if (type === "direct" && participantIds.length !== 1) {
      return NextResponse.json({ error: "Direct chat must have exactly 2 participants" }, { status: 400 })
    }

    // Verify all participants exist
    const participants = await User.find({ _id: { $in: participantIds } })
    if (participants.length !== participantIds.length) {
      return NextResponse.json({ error: "Some participants not found" }, { status: 400 })
    }

    // Add current user to participants if not already included
    const allParticipantIds = [user._id, ...participantIds.filter(id => id !== user._id.toString())]

    // For direct chats, check if chat already exists
    if (type === "direct") {
      const existingChat = await Chat.findOne({
        type: "direct",
        participants: { $all: allParticipantIds, $size: 2 },
        isActive: true,
      })

      if (existingChat) {
        return NextResponse.json({
          success: true,
          chat: existingChat,
          message: "Chat already exists",
        })
      }
    }

    // Create new chat
    const chat = new Chat({
      name: type === "group" ? name : null,
      type,
      avatar: type === "group" ? avatar : null, // Include avatar for group chats
      description: type === "group" && description ? description : null,
      createdBy: user._id,
      participants: allParticipantIds,
      participantCount: allParticipantIds.length,
      lastActivity: new Date(), // Set current time as last activity
    })

    await chat.save()

    // Create chat participants
    const chatParticipants = allParticipantIds.map((participantId, index) => ({
      chat: chat._id,
      user: participantId,
      role: participantId.toString() === user._id.toString() ? "admin" : "member",
    }))

    await ChatParticipant.insertMany(chatParticipants)

    // Populate the created chat
    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name email icon bonsai")
      .populate("createdBy", "name email")

    // Format the response to match the expected format
    const formattedChat = {
      id: populatedChat._id,
      name: populatedChat.name,
      type: populatedChat.type,
      avatar: populatedChat.avatar,
      description: populatedChat.description,
      createdBy: populatedChat.createdBy,
      lastMessage: null,
      lastActivity: populatedChat.lastActivity,
      participants: populatedChat.participants,
      participantCount: populatedChat.participantCount,
      isActive: populatedChat.isActive,
    }

    return NextResponse.json({
      success: true,
      chat: formattedChat,
      message: "Chat created successfully",
    })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
}
