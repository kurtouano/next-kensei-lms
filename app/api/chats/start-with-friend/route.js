import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import User from "@/models/User"
import { getOrCreateFriendChat } from "@/lib/friendChatIntegration"

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

    console.log("Starting chat with friend ID:", friendId)

    // Find current user
    const currentUser = await User.findOne({ email: session.user.email })
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't allow chatting with self
    if (currentUser._id.toString() === friendId) {
      return NextResponse.json({ error: "Cannot start chat with yourself" }, { status: 400 })
    }

    // Get or create chat with friend
    const chatResult = await getOrCreateFriendChat(currentUser._id, friendId)

    if (chatResult.success) {
      return NextResponse.json({
        success: true,
        chatId: chatResult.chat._id,
        chat: chatResult.chat,
        isNewChat: chatResult.isNew,
        message: chatResult.message,
      })
    } else {
      return NextResponse.json(
        { error: chatResult.message || "Failed to create chat" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error starting chat with friend:", error)
    
    if (error.message === "Users are not friends") {
      return NextResponse.json(
        { error: "You can only start chats with your friends" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "Failed to start chat" },
      { status: 500 }
    )
  }
}
