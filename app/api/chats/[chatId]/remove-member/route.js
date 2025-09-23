import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDb } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import ChatParticipant from '@/models/ChatParticipant'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = params
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

    // Check if user is the creator/admin
    if (chat.createdBy?.toString() !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only the group creator can remove members' 
      }, { status: 403 })
    }

    // Check if trying to remove the creator
    if (memberId === chat.createdBy?.toString()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot remove the group creator' 
      }, { status: 400 })
    }

    // Find and remove the member
    const participantIndex = chat.participants.findIndex(p => 
      (p._id || p.id)?.toString() === memberId
    )

    if (participantIndex === -1) {
      return NextResponse.json({ success: false, error: 'Member not found in chat' }, { status: 404 })
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
