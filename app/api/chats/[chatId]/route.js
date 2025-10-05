import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"

// GET - Fetch specific chat details
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()
    const { chatId } = await params

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name role icon bonsai')
      .populate('createdBy', 'name role icon bonsai')
      .lean()

    if (!chat) {
      return NextResponse.json({ success: false, error: "Chat not found" }, { status: 404 })
    }

    // Check if user is a participant
    const isParticipant = chat.participants?.some(participant => 
      participant._id?.toString() === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ success: true, chat })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch chat" }, { status: 500 })
  }
}

// PUT - Update chat information (name, avatar)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()
    const { chatId } = await params
    const body = await request.json()
    const { name, avatar } = body

    // Validate input
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Group name is required" }, { status: 400 })
    }

    if (name.length > 50) {
      return NextResponse.json({ success: false, error: "Group name must be 50 characters or less" }, { status: 400 })
    }

    // Find the chat and check if user is an admin
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ success: false, error: "Chat not found" }, { status: 404 })
    }

    // Check if user is an admin
    const participant = await ChatParticipant.findOne({
      chat: chatId,
      user: session.user.id,
      isActive: true
    })

    if (!participant || participant.role !== 'admin') {
      return NextResponse.json({ success: false, error: "Only admins can edit group information" }, { status: 403 })
    }

    // Update the chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        name: name.trim(),
        avatar: avatar || null,
        lastActivity: new Date()
      },
      { new: true }
    )
      .populate('participants', 'name role icon bonsai')
      .populate('createdBy', 'name role icon bonsai')
      .lean()

    return NextResponse.json({
      success: true,
      message: "Group updated successfully",
      chat: updatedChat
    })
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ success: false, error: "Failed to update group" }, { status: 500 })
  }
}