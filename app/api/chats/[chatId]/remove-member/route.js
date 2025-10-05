import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDb } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import ChatParticipant from '@/models/ChatParticipant'
import User from '@/models/User'
import { createRemoveMessage } from '@/lib/systemMessageHelper'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params
    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 })
    }

    await connectDb()

    // Find the chat
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
      return NextResponse.json({ 
        success: false, 
        error: 'Only admins can remove members' 
      }, { status: 403 })
    }

    // Check if trying to remove another admin
    const targetParticipant = await ChatParticipant.findOne({
      chat: chatId,
      user: memberId,
      isActive: true
    })

    if (targetParticipant?.role === 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot remove another admin. Demote them to member first.' 
      }, { status: 400 })
    }

    // Find and remove the member
    const participantIndex = chat.participants.findIndex(p => 
      (p._id || p.id)?.toString() === memberId
    )

    if (participantIndex === -1) {
      return NextResponse.json({ success: false, error: 'Member not found in chat' }, { status: 404 })
    }

    // Get user names for system message
    const removedUser = await User.findById(memberId)
    const removedUserName = removedUser?.name || 'Unknown User'
    const currentUser = await User.findById(session.user.id)
    const currentUserName = currentUser?.name || 'Unknown User'

    // Create system message for member removal
    try {
      await createRemoveMessage(chatId, removedUserName, currentUserName)
      
      // Force a small delay to ensure the message is properly saved and broadcasted
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (systemMessageError) {
      console.error('Error creating remove system message:', systemMessageError)
      // Don't fail the entire request if system message creation fails
    }

    // Remove member from participants
    chat.participants.splice(participantIndex, 1)

    // Update ChatParticipant record to mark user as inactive
    await ChatParticipant.findOneAndUpdate(
      { chat: chatId, user: memberId },
      { 
        isActive: false, 
        leftAt: new Date() 
      }
    )

    // Update last activity
    chat.lastActivity = new Date()
    await chat.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Member removed successfully',
      chat: chat
    })

  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove member' 
    }, { status: 500 })
  }
}
