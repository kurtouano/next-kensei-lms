import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"
import { createAddedMessage } from "@/lib/systemMessageHelper"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { chatId } = await params
    const { friendIds } = await request.json()

    // Find current user
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

    // Get the chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Only allow invites for group chats
    if (chat.type !== "group") {
      return NextResponse.json({ error: "Can only invite to group chats" }, { status: 400 })
    }

    // Validate input
    if (!friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
      return NextResponse.json({ error: "Friend IDs required" }, { status: 400 })
    }

    // Verify all friends exist
    const friends = await User.find({ _id: { $in: friendIds } })
    if (friends.length !== friendIds.length) {
      return NextResponse.json({ error: "Some friends not found" }, { status: 400 })
    }

    // Filter out friends who are already in the group
    const existingParticipantIds = chat.participants.map(p => p.toString())
    const newParticipantIds = friendIds.filter(id => !existingParticipantIds.includes(id.toString()))

    if (newParticipantIds.length === 0) {
      return NextResponse.json({ error: "All selected friends are already in the group" }, { status: 400 })
    }

    // Add new participants to the chat
    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { participants: { $each: newParticipantIds } }
    })

    // Create or reactivate chat participants for new members
    const participantPromises = newParticipantIds.map(async (participantId) => {
      // Check if user was previously in this chat
      const existingParticipant = await ChatParticipant.findOne({
        chat: chatId,
        user: participantId
      })

      if (existingParticipant) {
        // Reactivate existing participant
        return ChatParticipant.findByIdAndUpdate(existingParticipant._id, {
          isActive: true,
          joinedAt: new Date(),
          leftAt: null
        })
      } else {
        // Create new participant
        return ChatParticipant.create({
          chat: chatId,
          user: participantId,
          joinedAt: new Date(),
          isActive: true,
        })
      }
    })

    await Promise.all(participantPromises)

    // Create system messages for each new participant
    // Get the current user's name for the "added by" message
    const currentUserName = user.name || 'Unknown User'
    
    const systemMessagePromises = newParticipantIds.map(async (participantId) => {
      const friend = friends.find(f => f._id.toString() === participantId.toString())
      if (friend) {
        try {
          const result = await createAddedMessage(chatId, friend.name, currentUserName)
          return result
        } catch (error) {
          console.error(`Error creating added message for ${friend.name}:`, error)
          return null
        }
      }
      return null
    })

    try {
      await Promise.all(systemMessagePromises)
      
      // Force a small delay to ensure all messages are properly saved and broadcasted
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error('Error creating some added messages:', error)
      // Don't fail the entire request if some system messages fail
    }

    // Update chat's last activity
    await Chat.findByIdAndUpdate(chatId, {
      lastActivity: new Date()
    })

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
      message: `Successfully invited ${newParticipantIds.length} friends to the group`,
      chat: updatedChat,
      invitedCount: newParticipantIds.length
    })
  } catch (error) {
    console.error("Error inviting friends:", error)
    return NextResponse.json(
      { error: "Failed to invite friends" },
      { status: 500 }
    )
  }
}
