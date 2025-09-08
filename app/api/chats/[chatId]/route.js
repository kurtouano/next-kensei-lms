import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId } = await params

    // Find current user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the chat with populated data
    const chat = await Chat.findById(chatId)
      .populate({
        path: "participants",
        select: "name email icon bonsai lastSeen",
        populate: {
          path: "bonsai",
          select: "level customization",
        },
      })
      .populate("createdBy", "name email")

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // For public access (invite links), we don't check participation
    // The join endpoint will handle adding the user if they're not already a member

    return NextResponse.json({
      success: true,
      chat: {
        id: chat._id,
        name: chat.name,
        description: chat.description,
        type: chat.type,
        participants: chat.participants,
        createdBy: chat.createdBy,
        createdAt: chat.createdAt,
        lastActivity: chat.lastActivity,
      }
    })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    )
  }
}
