import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import User from "@/models/User"
import ChatParticipant from "@/models/ChatParticipant"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    // Get user details to check role
    const user = await User.findById(session.user.id).select('role name email')
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has permission to create public groups
    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { error: "Only admins and instructors can create public groups" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, avatar } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Create the public group
    const publicGroup = new Chat({
      name: name.trim(),
      avatar: avatar || null,
      isPublic: true,
      type: "public_group",
      createdBy: session.user.id,
      participants: [session.user.id], // Creator is automatically a participant
      participantCount: 1,
      isActive: true
    })

    await publicGroup.save()

    // Create ChatParticipant record for the creator
    const chatParticipant = new ChatParticipant({
      chat: publicGroup._id,
      user: session.user.id,
      role: "admin", // Creator is admin
      isActive: true
    })
    await chatParticipant.save()

    // Populate the created group for response
    const populatedGroup = await Chat.findById(publicGroup._id)
      .populate('createdBy', 'name email role icon bonsai')
      .populate('participants', 'name email role icon bonsai')
      .lean()

    const formattedGroup = {
      id: populatedGroup._id.toString(),
      name: populatedGroup.name,
      avatar: populatedGroup.avatar,
      members: populatedGroup.participantCount,
      createdBy: {
        id: populatedGroup.createdBy._id.toString(),
        name: populatedGroup.createdBy.name,
        role: populatedGroup.createdBy.role,
        icon: populatedGroup.createdBy.icon,
        bonsai: populatedGroup.createdBy.bonsai
      },
      isJoined: true, // Creator is automatically joined
      createdAt: populatedGroup.createdAt,
      lastActivity: populatedGroup.lastActivity
    }

    return NextResponse.json({
      success: true,
      message: "Public group created successfully",
      group: formattedGroup
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating public group:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create public group" },
      { status: 500 }
    )
  }
}
