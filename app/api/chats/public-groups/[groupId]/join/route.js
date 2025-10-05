import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import User from "@/models/User"
import ChatParticipant from "@/models/ChatParticipant"
import Message from "@/models/Message"
import { createLeaveMessage } from "@/lib/systemMessageHelper"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { groupId } = await params

    // Find the public group
    const publicGroup = await Chat.findOne({
      _id: groupId,
      isPublic: true,
      isActive: true,
      type: "public_group"
    })

    if (!publicGroup) {
      return NextResponse.json(
        { error: "Public group not found" },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const isAlreadyMember = publicGroup.participants.includes(session.user.id)

    if (isAlreadyMember) {
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      )
    }

    // Check if group has reached max members
    if (publicGroup.participantCount >= publicGroup.maxMembers) {
      return NextResponse.json(
        { error: "This group has reached its maximum member limit" },
        { status: 400 }
      )
    }

    // Add user to the group
    publicGroup.participants.push(session.user.id)
    publicGroup.participantCount += 1
    publicGroup.lastActivity = new Date()

    await publicGroup.save()

    // Create or reactivate ChatParticipant record for the user
    const existingParticipant = await ChatParticipant.findOne({
      chat: groupId,
      user: session.user.id
    })

    if (existingParticipant) {
      // Reactivate existing participant
      existingParticipant.isActive = true
      existingParticipant.leftAt = null
      await existingParticipant.save()
    } else {
      // Check if user is the creator to preserve admin role
      const isCreator = publicGroup.createdBy.toString() === session.user.id
      const userRole = isCreator ? "admin" : "member"
      
      // Create new ChatParticipant record
      const chatParticipant = new ChatParticipant({
        chat: groupId,
        user: session.user.id,
        role: userRole,
        isActive: true
      })
      await chatParticipant.save()
    }

    // Populate the updated group
    const updatedGroup = await Chat.findById(groupId)
      .populate('createdBy', 'name email role icon bonsai')
      .populate('participants', 'name email role icon bonsai')
      .lean()

    const formattedGroup = {
      id: updatedGroup._id.toString(),
      name: updatedGroup.name,
      description: updatedGroup.description,
      avatar: updatedGroup.avatar,
      members: updatedGroup.participantCount,
      maxMembers: updatedGroup.maxMembers,
      createdBy: {
        id: updatedGroup.createdBy._id.toString(),
        name: updatedGroup.createdBy.name,
        role: updatedGroup.createdBy.role,
        icon: updatedGroup.createdBy.icon,
        bonsai: updatedGroup.createdBy.bonsai
      },
      isJoined: true,
      createdAt: updatedGroup.createdAt,
      lastActivity: updatedGroup.lastActivity
    }

    return NextResponse.json({
      message: "Successfully joined the group",
      group: formattedGroup
    })

  } catch (error) {
    console.error("Error joining public group:", error)
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { groupId } = await params

    // Find the public group
    const publicGroup = await Chat.findOne({
      _id: groupId,
      isPublic: true,
      isActive: true,
      type: "public_group"
    })

    if (!publicGroup) {
      return NextResponse.json(
        { error: "Public group not found" },
        { status: 404 }
      )
    }

    // Check if user is a member (either in participants array or has active ChatParticipant)
    const isInParticipants = publicGroup.participants.includes(session.user.id)
    const hasActiveParticipant = await ChatParticipant.findOne({
      chat: groupId,
      user: session.user.id,
      isActive: true
    })

    if (!isInParticipants && !hasActiveParticipant) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 400 }
      )
    }

    // Check if user is an admin and if they're the only admin
    if (hasActiveParticipant?.role === 'admin') {
      // Check total active participants in the group
      const totalActiveParticipants = await ChatParticipant.countDocuments({
        chat: groupId,
        isActive: true
      })

      // If user is the only person left in the group, allow them to leave
      if (totalActiveParticipants <= 1) {
        // Allow leaving - this will delete the group since they're the only one left
      } else {
        // Check if they're the only admin among multiple people
        const adminCount = await ChatParticipant.countDocuments({
          chat: groupId,
          role: 'admin',
          isActive: true
        })

        if (adminCount <= 1) {
          return NextResponse.json({ 
            success: false, 
            error: 'You are the only admin. Transfer admin rights to another member before leaving the group.' 
          }, { status: 400 })
        }
      }
    }

    // Get user name for system message
    const user = await User.findById(session.user.id)
    const userName = user?.name || 'Unknown User'

    // Create system message for user leaving
    console.log(`Creating leave message for public group ${groupId}: ${userName} left`)
    await createLeaveMessage(groupId, userName)
    console.log(`Leave message created successfully`)

    // Remove user from the group (only if they're in participants array)
    if (isInParticipants) {
      publicGroup.participants = publicGroup.participants.filter(
        participantId => participantId.toString() !== session.user.id
      )
      publicGroup.participantCount = Math.max(0, publicGroup.participantCount - 1)
      publicGroup.lastActivity = new Date()
      await publicGroup.save()
    }

    // Deactivate ChatParticipant record for the user
    await ChatParticipant.findOneAndUpdate(
      { chat: groupId, user: session.user.id },
      { isActive: false, leftAt: new Date() }
    )

    // Check if group has any active members left
    const activeMembersCount = await ChatParticipant.countDocuments({
      chat: groupId,
      isActive: true
    })

    // If no active members, delete the group automatically
    if (activeMembersCount === 0) {
      console.log(`Auto-deleting public group ${groupId} - no active members`)
      
      // Delete all messages in the group
      await Message.deleteMany({ chat: groupId })
      
      // Delete all chat participants
      await ChatParticipant.deleteMany({ chat: groupId })
      
      // Delete the group itself
      await Chat.findByIdAndDelete(groupId)
      
      return NextResponse.json({
        success: true,
        message: "Successfully left the group. Group was automatically deleted as it had no members."
      })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully left the group"
    })

  } catch (error) {
    console.error("Error leaving public group:", error)
    return NextResponse.json(
      { success: false, error: "Failed to leave group" },
      { status: 500 }
    )
  }
}
