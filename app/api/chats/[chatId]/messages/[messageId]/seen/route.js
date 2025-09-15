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

    // Don't mark your own messages as seen
    if (message.sender.toString() === user._id.toString()) {
      return NextResponse.json({ error: "Cannot mark own message as seen" }, { status: 400 })
    }

    // Check if user has already seen this message
    const hasSeenAlready = message.readBy.some(entry => entry.user.toString() === user._id.toString())

    if (!hasSeenAlready) {
      // Add user to readBy (seen) list
      message.readBy.push({
        user: user._id,
        readAt: new Date(),
      })

      await message.save()
    }

    return NextResponse.json({
      success: true,
      message: "Message marked as seen",
    })
  } catch (error) {
    console.error("Error marking message as seen:", error)
    return NextResponse.json(
      { error: "Failed to mark message as seen" },
      { status: 500 }
    )
  }
}
