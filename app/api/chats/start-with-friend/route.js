import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { friendId } = await request.json()

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID is required" }, { status: 400 })
    }

    // Find current user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find friend user
    const friend = await User.findById(friendId)
    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 })
    }

    // Check if direct chat already exists between these two users (active or inactive)
    const existingChat = await Chat.findOne({
      type: "direct",
      participants: { $all: [user._id, friend._id], $size: 2 },
    })

    if (existingChat) {
      if (existingChat.isActive) {
        console.log(`✅ Found existing active chat between ${user.name} and ${friend.name}`)
        return NextResponse.json({
          success: true,
          chatId: existingChat._id.toString(),
          isNewChat: false,
          message: "Chat already exists"
        })
      } else {
        // Chat exists but is inactive, reactivate it
        console.log(`🔄 Reactivating existing chat between ${user.name} and ${friend.name}`)
        existingChat.isActive = true
        existingChat.lastActivity = new Date()
        await existingChat.save()

        // Reactivate chat participants
        await ChatParticipant.updateMany(
          { 
            chat: existingChat._id,
            user: { $in: [user._id, friend._id] }
          },
          { 
            isActive: true,
            joinedAt: new Date(),
            lastRead: new Date()
          }
        )

        console.log(`✅ Successfully reactivated chat and participants`)
        
        return NextResponse.json({
          success: true,
          chatId: existingChat._id.toString(),
          isNewChat: false,
          message: "Chat reactivated"
        })
      }
    }

    // Create new direct chat
    const chat = new Chat({
      name: null, // Direct chats don't have names
      type: "direct",
      avatar: null, // Direct chats don't have avatars
      description: null,
      createdBy: user._id,
      participants: [user._id, friend._id],
      participantCount: 2,
      lastActivity: new Date(),
      isActive: true
    })

    await chat.save()

    // Create chat participants
    const chatParticipants = [
      {
        chat: chat._id,
        user: user._id,
        role: "admin",
        isActive: true
      },
      {
        chat: chat._id,
        user: friend._id,
        role: "member",
        isActive: true
      }
    ]

    await ChatParticipant.insertMany(chatParticipants)

    console.log(`✅ Created new chat between ${user.name} and ${friend.name}`)

    return NextResponse.json({
      success: true,
      chatId: chat._id.toString(),
      isNewChat: true,
      message: "Chat created successfully"
    })

  } catch (error) {
    console.error("Error starting chat with friend:", error)
    return NextResponse.json(
      { error: "Failed to start chat with friend" },
      { status: 500 }
    )
  }
}