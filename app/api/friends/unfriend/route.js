import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Friend from "@/models/Friend"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { friendId } = await request.json()

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID is required" }, { status: 400 })
    }

    await connectDb()

    // Find and remove the friendship from both directions
    const friendship1 = await Friend.findOneAndDelete({
      requester: session.user.id,
      recipient: friendId,
      status: 'accepted'
    })

    const friendship2 = await Friend.findOneAndDelete({
      requester: friendId,
      recipient: session.user.id,
      status: 'accepted'
    })

    // Check if any friendship was found and removed
    if (!friendship1 && !friendship2) {
      return NextResponse.json({ 
        error: "Friendship not found or already removed" 
      }, { status: 404 })
    }

    // Deactivate any direct chat between these users
    try {
      const directChat = await Chat.findOne({
        type: "direct",
        participants: { $all: [session.user.id, friendId], $size: 2 },
        isActive: true
      })

      if (directChat) {
        console.log(`Deactivating direct chat between ${session.user.id} and ${friendId}`)
        
        // Deactivate the chat
        directChat.isActive = false
        await directChat.save()

        // Deactivate chat participants
        await ChatParticipant.updateMany(
          { 
            chat: directChat._id,
            user: { $in: [session.user.id, friendId] }
          },
          { isActive: false }
        )

        console.log(`Successfully deactivated chat and participants`)
      }
    } catch (chatError) {
      console.error("Error handling chat cleanup during unfriend:", chatError)
      // Don't fail the unfriend operation if chat cleanup fails
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unfriended"
    })

  } catch (error) {
    console.error("Error unfriending user:", error)
    return NextResponse.json(
      { error: "Failed to unfriend user" },
      { status: 500 }
    )
  }
}
