// Script to fix ChatParticipant records for users who left groups
// This will set isActive: false for users who are not in chat.participants but have active ChatParticipant records

import { connectDb } from '../lib/mongodb.js'
import Chat from '../models/Chat.js'
import ChatParticipant from '../models/ChatParticipant.js'

async function fixChatParticipants() {
  try {
    console.log('Connecting to database...')
    await connectDb()
    
    console.log('Finding all active ChatParticipant records...')
    const activeParticipants = await ChatParticipant.find({ isActive: true })
    
    console.log(`Found ${activeParticipants.length} active participants`)
    
    let fixedCount = 0
    
    for (const participant of activeParticipants) {
      // Find the chat for this participant
      const chat = await Chat.findById(participant.chat)
      
      if (!chat) {
        console.log(`Chat not found for participant ${participant._id}, marking as inactive`)
        await ChatParticipant.findByIdAndUpdate(participant._id, { 
          isActive: false, 
          leftAt: new Date() 
        })
        fixedCount++
        continue
      }
      
      // Check if user is still in chat.participants
      const isStillInChat = chat.participants.some(p => 
        (p._id || p.id)?.toString() === participant.user.toString()
      )
      
      if (!isStillInChat) {
        console.log(`User ${participant.user} is not in chat ${chat._id} participants, marking as inactive`)
        await ChatParticipant.findByIdAndUpdate(participant._id, { 
          isActive: false, 
          leftAt: new Date() 
        })
        fixedCount++
      }
    }
    
    console.log(`Fixed ${fixedCount} ChatParticipant records`)
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Error fixing ChatParticipant records:', error)
  } finally {
    process.exit(0)
  }
}

fixChatParticipants()
