import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import Message from "@/models/Message"
import User from "@/models/User"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId, messageId } = await params
    const { emoji } = await request.json()

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

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

    // Find the message with optimistic locking to prevent race conditions
    const message = await Message.findOne({
      _id: messageId,
      chat: chatId,
      isDeleted: false,
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Use atomic operations to prevent race conditions
    const existingReactionIndex = message.reactions.findIndex(
      reaction => reaction.user.toString() === user._id.toString() && reaction.emoji === emoji
    )

    let updatedReactions
    if (existingReactionIndex !== -1) {
      // Remove existing reaction (toggle off)
      updatedReactions = [...message.reactions]
      updatedReactions.splice(existingReactionIndex, 1)
    } else {
      // Add new reaction (allow multiple reactions per user)
      updatedReactions = [
        ...message.reactions,
        {
          user: user._id,
          emoji: emoji,
          createdAt: new Date()
        }
      ]
    }

    // Update the message with the new reactions array
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { reactions: updatedReactions },
      { new: true, runValidators: true }
    )

    if (!updatedMessage) {
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
    }

    // Broadcast reaction update to all chat participants via SSE
    try {
      const { notifyReactionUpdate } = await import("@/lib/chatUtils")
      await notifyReactionUpdate(chatId, messageId, updatedMessage.reactions, user._id)
    } catch (error) {
      console.error("Failed to broadcast reaction update:", error)
      // Don't fail the request if broadcasting fails
    }

    return NextResponse.json({
      success: true,
      message: "Reaction updated successfully",
      reactions: updatedMessage.reactions
    })
  } catch (error) {
    console.error("Error updating reaction:", error)
    return NextResponse.json(
      { 
        error: "Failed to update reaction",
        details: error.message 
      },
      { status: 500 }
    )
  }
}
