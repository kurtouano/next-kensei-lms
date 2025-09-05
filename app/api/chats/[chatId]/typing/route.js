import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"
import { notifyTyping } from "@/lib/chatUtils"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId } = await params
    const { isTyping } = await request.json()

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

    // Broadcast typing indicator to other participants
    await notifyTyping(chatId, user._id, user.name, isTyping)

    return NextResponse.json({
      success: true,
      message: isTyping ? "Typing indicator sent" : "Typing indicator cleared",
    })
  } catch (error) {
    console.error("Error handling typing indicator:", error)
    return NextResponse.json(
      { error: "Failed to handle typing indicator" },
      { status: 500 }
    )
  }
}
