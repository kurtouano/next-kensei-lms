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

    // Find the message
    const message = await Message.findOne({
      _id: messageId,
      chat: chatId,
      isDeleted: false,
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user has already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      reaction => reaction.user.toString() === user._id.toString() && reaction.emoji === emoji
    )

    if (existingReactionIndex !== -1) {
      // Remove existing reaction (toggle off)
      message.reactions.splice(existingReactionIndex, 1)
    } else {
      // Add new reaction (allow multiple reactions per user)
      message.reactions.push({
        user: user._id,
        emoji: emoji,
        createdAt: new Date()
      })
    }

    await message.save()

    return NextResponse.json({
      success: true,
      message: "Reaction updated successfully",
      reactions: message.reactions
    })
  } catch (error) {
    console.error("Error updating reaction:", error)
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    )
  }
}
