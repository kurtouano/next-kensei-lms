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
    const { userId } = await request.json()

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 })
    }

    await connectDb()

    // Find the chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 })
    }

    // Check if user is in the chat
    const participantIndex = chat.participants.findIndex(p => 
      (p._id || p.id)?.toString() === userId
    )

    if (participantIndex === -1) {
      return NextResponse.json({ success: false, error: 'User not in chat' }, { status: 400 })
    }

    // Check if the leaving user is the creator/admin
    const isCreator = chat.createdBy?.toString() === userId
    const wasCreator = isCreator

    // Prevent admin from leaving without transferring admin rights
    if (wasCreator && chat.participants.length > 1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin must transfer admin rights before leaving the group' 
      }, { status: 400 })
    }

    // Remove user from participants
    chat.participants.splice(participantIndex, 1)

    // Update ChatParticipant record to mark user as inactive
    // Use upsert to handle cases where record might not exist
    await ChatParticipant.findOneAndUpdate(
      { chat: chatId, user: userId },
      { 
        isActive: false, 
        leftAt: new Date() 
      },
      { upsert: true, new: true }
    )

    // If it's a group chat and no participants left, delete the chat
    if (chat.type === 'group' && chat.participants.length === 0) {
      await Chat.findByIdAndDelete(chatId)
      return NextResponse.json({ success: true, message: 'Chat deleted as no participants remain' })
    }

    // Note: Admin transfer should be handled explicitly before leaving
    // This ensures the admin consciously chooses who gets admin rights

    // Update last activity
    chat.lastActivity = new Date()
    await chat.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully left the chat',
      chat: chat
    })

  } catch (error) {
    console.error('Error leaving chat:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to leave chat',
      details: error.message
    }, { status: 500 })
  }
}
