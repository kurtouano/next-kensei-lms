import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDb } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import ChatParticipant from '@/models/ChatParticipant'
import User from '@/models/User'
import { createAdminTransferMessage } from '@/lib/systemMessageHelper'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = params
    const { newAdminId } = await request.json()

    if (!newAdminId) {
      return NextResponse.json({ success: false, error: 'New admin ID required' }, { status: 400 })
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
        error: 'Only admins can transfer admin rights' 
      }, { status: 403 })
    }

    // Check if new admin is a participant in the chat
    const isNewAdminParticipant = chat.participants.some(p => 
      (p._id || p.id)?.toString() === newAdminId
    )

    if (!isNewAdminParticipant) {
      return NextResponse.json({ 
        success: false, 
        error: 'New admin must be a participant in the chat' 
      }, { status: 400 })
    }

    // Check if trying to transfer to self
    if (newAdminId === session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot transfer admin rights to yourself' 
      }, { status: 400 })
    }

    // Get user names for system message
    const newAdminUser = await User.findById(newAdminId)
    const newAdminName = newAdminUser?.name || 'Unknown User'
    const currentUser = await User.findById(session.user.id)
    const currentUserName = currentUser?.name || 'Unknown User'

    // Update ChatParticipant roles
    await ChatParticipant.findOneAndUpdate(
      { chat: chatId, user: session.user.id },
      { role: 'member' }
    )

    await ChatParticipant.findOneAndUpdate(
      { chat: chatId, user: newAdminId },
      { role: 'admin' }
    )

    // Create system message for admin transfer
    await createAdminTransferMessage(chatId, newAdminName, currentUserName)

    // Update chat's createdBy field (for backward compatibility)
    chat.createdBy = newAdminId
    chat.lastActivity = new Date()
    await chat.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Admin rights transferred successfully',
      newAdminId: newAdminId
    })

  } catch (error) {
    console.error('Error transferring admin rights:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to transfer admin rights',
      details: error.message
    }, { status: 500 })
  }
}
