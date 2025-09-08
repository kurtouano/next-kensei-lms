import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId } = await params
    const { inviteCode } = await request.json()

    // Find current user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Only allow joining group chats
    if (chat.type !== "group") {
      return NextResponse.json({ error: "Can only join group chats" }, { status: 400 })
    }

    // Check if user is already a participant
    const existingParticipation = await ChatParticipant.findOne({
      chat: chatId,
      user: user._id,
    })

    if (existingParticipation) {
      if (existingParticipation.isActive) {
        return NextResponse.json({ 
          success: true, 
          message: "You are already a member of this group",
          chat: chat 
        })
      } else {
        // Reactivate participation
        await ChatParticipant.findByIdAndUpdate(existingParticipation._id, {
          isActive: true,
          joinedAt: new Date(),
        })
      }
    } else {
      // Add user to participants
      await Chat.findByIdAndUpdate(chatId, {
        $addToSet: { participants: user._id }
      })

      // Create new participation
      await ChatParticipant.create({
        chat: chatId,
        user: user._id,
        joinedAt: new Date(),
        isActive: true,
      })
    }

    // Get updated chat with populated participants
    const updatedChat = await Chat.findById(chatId)
      .populate({
        path: "participants",
        select: "name email icon bonsai lastSeen",
        populate: {
          path: "bonsai",
          select: "level customization",
        },
      })

    return NextResponse.json({
      success: true,
      message: "Successfully joined the group",
      chat: updatedChat
    })
  } catch (error) {
    console.error("Error joining group:", error)
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    )
  }
}
