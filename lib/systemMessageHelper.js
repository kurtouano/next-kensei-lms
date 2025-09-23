import Message from '@/models/Message'
import { notifyNewMessage, formatMessageForBroadcast } from './chatUtils'

/**
 * Create a system message for group chat events
 * @param {string} chatId - The chat ID
 * @param {string} content - The system message content
 * @param {string} eventType - The type of event (join, leave, etc.)
 * @returns {Object} The created message
 */
export async function createSystemMessage(chatId, content, eventType = 'system') {
  try {
    // Create a system message with a special system sender
    // We'll use a special ObjectId that represents the system
    const systemSenderId = '000000000000000000000000' // 24-character ObjectId for system
    
    const systemMessage = new Message({
      chat: chatId,
      sender: systemSenderId, // Use special system sender ID
      content: content,
      type: 'system',
      // Add event type as metadata
      attachments: [{
        type: 'general',
        url: eventType, // Store event type in URL field for easy filtering
        filename: eventType,
        size: 0,
        mimeType: 'text/plain'
      }]
    })

    const savedMessage = await systemMessage.save()
    
    // Format and broadcast the system message
    const formattedMessage = {
      id: savedMessage._id,
      content: savedMessage.content,
      type: savedMessage.type,
      sender: {
        id: '000000000000000000000000',
        name: 'System',
        email: 'system@kensei-lms.com',
        icon: null,
      },
      attachments: savedMessage.attachments || [],
      reactions: savedMessage.reactions || [],
      replyTo: null,
      readBy: savedMessage.readBy || [],
      seenBy: savedMessage.readBy || [],
      isEdited: savedMessage.isEdited,
      editedAt: savedMessage.editedAt,
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt,
    }
    
    // Broadcast the system message to all chat participants
    console.log('Broadcasting system message:', formattedMessage)
    await notifyNewMessage(chatId, formattedMessage)
    
    return savedMessage
  } catch (error) {
    console.error('Error creating system message:', error)
    throw error
  }
}

/**
 * Create a join message
 * @param {string} chatId - The chat ID
 * @param {string} userName - The name of the user who joined
 * @returns {Object} The created message
 */
export async function createJoinMessage(chatId, userName) {
  return await createSystemMessage(
    chatId, 
    `${userName} joined the group`, 
    'join'
  )
}

/**
 * Create a leave message
 * @param {string} chatId - The chat ID
 * @param {string} userName - The name of the user who left
 * @returns {Object} The created message
 */
export async function createLeaveMessage(chatId, userName) {
  return await createSystemMessage(
    chatId, 
    `${userName} left the group`, 
    'leave'
  )
}

/**
 * Create a remove message
 * @param {string} chatId - The chat ID
 * @param {string} userName - The name of the user who was removed
 * @param {string} removedBy - The name of the user who removed them
 * @returns {Object} The created message
 */
export async function createRemoveMessage(chatId, userName, removedBy) {
  return await createSystemMessage(
    chatId, 
    `${userName} was removed by ${removedBy}`, 
    'remove'
  )
}

/**
 * Create an admin transfer message
 * @param {string} chatId - The chat ID
 * @param {string} newAdminName - The name of the new admin
 * @param {string} oldAdminName - The name of the old admin
 * @returns {Object} The created message
 */
export async function createAdminTransferMessage(chatId, newAdminName, oldAdminName) {
  return await createSystemMessage(
    chatId, 
    `${oldAdminName} transferred admin rights to ${newAdminName}`, 
    'admin_transfer'
  )
}

/**
 * Create a role change message
 * @param {string} chatId - The chat ID
 * @param {string} userName - The name of the user whose role changed
 * @param {string} newRole - The new role (admin/member)
 * @param {string} changedBy - The name of the user who made the change
 * @returns {Object} The created message
 */
export async function createRoleChangeMessage(chatId, userName, newRole, changedBy) {
  const roleText = newRole === 'admin' ? 'admin' : 'member'
  return await createSystemMessage(
    chatId, 
    `${userName} was made ${roleText} by ${changedBy}`, 
    'role_change'
  )
}
