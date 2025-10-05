import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDb } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import ChatParticipant from '@/models/ChatParticipant'
import User from '@/models/User'
import { createRoleChangeMessage } from '@/lib/systemMessageHelper'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params
    const { memberId, newRole } = await request.json()

    if (!memberId || !newRole) {
      return NextResponse.json({ success: false, error: 'Member ID and new role required' }, { status: 400 })
    }

    if (!['admin', 'member'].includes(newRole)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    await connectDb()

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 })
    }

    // Check if current user is an admin
    const currentUserParticipant = await ChatParticipant.findOne({
      chat: chatId,
      user: session.user.id,
      isActive: true
    })

    if (!currentUserParticipant || currentUserParticipant.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can change roles' }, { status: 403 })
    }

    // Check if target member is a participant
    const targetParticipant = await ChatParticipant.findOne({
      chat: chatId,
      user: memberId,
      isActive: true
    })

    if (!targetParticipant) {
      return NextResponse.json({ success: false, error: 'Member not found in chat' }, { status: 404 })
    }

    // Prevent admin from demoting themselves if they're the only admin
    if (memberId === session.user.id && newRole === 'member') {
      const adminCount = await ChatParticipant.countDocuments({
        chat: chatId,
        role: 'admin',
        isActive: true
      })

      if (adminCount <= 1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot demote yourself - you are the only admin. Transfer admin role to another member first.' 
        }, { status: 400 })
      }
    }

    // Get user names for system message
    const targetUser = await User.findById(memberId)
    const targetUserName = targetUser?.name || 'Unknown User'
    const currentUser = await User.findById(session.user.id)
    const currentUserName = currentUser?.name || 'Unknown User'

    // Update the role
    await ChatParticipant.findOneAndUpdate(
      { chat: chatId, user: memberId },
      { role: newRole }
    )

    // Create system message for role change
    try {
      await createRoleChangeMessage(chatId, targetUserName, newRole, currentUserName)
      
      // Force a small delay to ensure the message is properly saved and broadcasted
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (systemMessageError) {
      console.error('Error creating role change system message:', systemMessageError)
      // Don't fail the entire request if system message creation fails
    }

    // Update chat last activity
    chat.lastActivity = new Date()
    await chat.save()

    return NextResponse.json({ 
      success: true, 
      message: `Role changed to ${newRole}` 
    })

  } catch (error) {
    console.error('Error changing role:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to change role', 
      details: error.message 
    }, { status: 500 })
  }
}
