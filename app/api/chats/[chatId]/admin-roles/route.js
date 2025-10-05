import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDb } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import ChatParticipant from '@/models/ChatParticipant'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params

    await connectDb()

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 })
    }

    // Check if user is a participant in the chat
    const participant = await ChatParticipant.findOne({
      chat: chatId,
      user: session.user.id,
      isActive: true
    })

    if (!participant) {
      return NextResponse.json({ success: false, error: 'Not a participant in this chat' }, { status: 403 })
    }

    // Get all active participants and their roles
    const participants = await ChatParticipant.find({
      chat: chatId,
      isActive: true
    }).populate('user', 'name email')

    // Create roles object with user IDs as keys
    const roles = {}
    participants.forEach(participant => {
      const userId = participant.user._id.toString()
      roles[userId] = participant.role
    })

    return NextResponse.json({ 
      success: true, 
      roles: roles 
    })

  } catch (error) {
    console.error('Error fetching admin roles:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch admin roles', 
      details: error.message 
    }, { status: 500 })
  }
}
