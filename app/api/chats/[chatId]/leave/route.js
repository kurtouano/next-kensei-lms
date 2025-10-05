import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDb } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import ChatParticipant from '@/models/ChatParticipant'
import User from '@/models/User'
import { createLeaveMessage } from '@/lib/systemMessageHelper'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params
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

    // Check if user is an admin and if they're the only admin
    const userParticipant = await ChatParticipant.findOne({
      chat: chatId,
      user: userId,
      isActive: true
    })

    if (userParticipant?.role === 'admin') {
      // Check total active participants in the group
      const totalActiveParticipants = await ChatParticipant.countDocuments({
        chat: chatId,
        isActive: true
      })

      // If user is the only person left in the group, allow them to leave
      if (totalActiveParticipants <= 1) {
        // Allow leaving - this will delete the group since they're the only one left
      } else {
        // Check if they're the only admin among multiple people
        const adminCount = await ChatParticipant.countDocuments({
          chat: chatId,
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
    const user = await User.findById(userId)
    const userName = user?.name || 'Unknown User'

    // Create system message for user leaving
    console.log(`Creating leave message for chat ${chatId}: ${userName} left`)
    await createLeaveMessage(chatId, userName)
    console.log(`Leave message created successfully`)

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

    // Check if group has any active members left (using ChatParticipant records)
    const activeMembersCount = await ChatParticipant.countDocuments({
      chat: chatId,
      isActive: true
    })

    // If no active members, delete the group automatically
    if (activeMembersCount === 0) {
      console.log(`Auto-deleting group ${chatId} - no active members`)
      
      // Delete all messages in the group
      await Message.deleteMany({ chat: chatId })
      
      // Delete all chat participants
      await ChatParticipant.deleteMany({ chat: chatId })
      
      // Delete the group itself
      await Chat.findByIdAndDelete(chatId)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Group was automatically deleted as it had no members' 
      })
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
