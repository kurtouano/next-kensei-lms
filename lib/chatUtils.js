// Utility functions for chat real-time functionality

// Import the broadcast functions (these will be available when the server is running)
let broadcastToChat = null
let broadcastTyping = null
let broadcastOnlineStatus = null
let importAttempts = 0
const maxImportAttempts = 3

// Dynamically import the broadcast functions to avoid circular dependencies
async function getBroadcastFunctions() {
  if (!broadcastToChat && importAttempts < maxImportAttempts) {
    try {
      importAttempts++
      const streamModule = await import("@/app/api/chats/stream/route")
      broadcastToChat = streamModule.broadcastToChat
      broadcastTyping = streamModule.broadcastTyping
      broadcastOnlineStatus = streamModule.broadcastOnlineStatus
      console.log("Successfully imported broadcast functions")
    } catch (error) {
      console.error(`Failed to import broadcast functions (attempt ${importAttempts}):`, error)
      if (importAttempts >= maxImportAttempts) {
        console.error("Max import attempts reached, broadcast functions unavailable")
      }
    }
  }
  return { broadcastToChat, broadcastTyping, broadcastOnlineStatus }
}

// Broadcast new message to chat participants
export async function notifyNewMessage(chatId, message, excludeUserId = null) {
  try {
    const { broadcastToChat } = await getBroadcastFunctions()
    if (broadcastToChat) {
      console.log(`Broadcasting new message to chat ${chatId}`, message.id)
      broadcastToChat(chatId, {
        type: "new_message",
        message,
        timestamp: new Date().toISOString(),
      }, excludeUserId)
    } else {
      console.warn("Broadcast function not available, message not sent via SSE")
    }
  } catch (error) {
    console.error("Error broadcasting new message:", error)
  }
}

// Broadcast message edit
export async function notifyMessageEdit(chatId, messageId, updatedContent, excludeUserId = null) {
  try {
    const { broadcastToChat } = await getBroadcastFunctions()
    if (broadcastToChat) {
      broadcastToChat(chatId, {
        type: "message_edited",
        messageId,
        updatedContent,
        timestamp: new Date().toISOString(),
      }, excludeUserId)
    }
  } catch (error) {
    console.error("Error broadcasting message edit:", error)
  }
}

// Broadcast message deletion
export async function notifyMessageDelete(chatId, messageId, excludeUserId = null) {
  try {
    const { broadcastToChat } = await getBroadcastFunctions()
    if (broadcastToChat) {
      broadcastToChat(chatId, {
        type: "message_deleted",
        messageId,
        timestamp: new Date().toISOString(),
      }, excludeUserId)
    }
  } catch (error) {
    console.error("Error broadcasting message deletion:", error)
  }
}

// Broadcast typing indicator
export async function notifyTyping(chatId, userId, userName, isTyping) {
  try {
    const { broadcastTyping } = await getBroadcastFunctions()
    if (broadcastTyping) {
      broadcastTyping(chatId, {
        userId,
        userName,
        isTyping,
      })
    }
  } catch (error) {
    console.error("Error broadcasting typing indicator:", error)
  }
}

// Broadcast user online status
export async function notifyUserStatus(userId, isOnline) {
  try {
    const { broadcastOnlineStatus } = await getBroadcastFunctions()
    if (broadcastOnlineStatus) {
      broadcastOnlineStatus(userId, isOnline)
    }
  } catch (error) {
    console.error("Error broadcasting user status:", error)
  }
}

// Utility to format message for real-time broadcast
export function formatMessageForBroadcast(message) {
  return {
    id: message._id,
    content: message.content,
    type: message.type,
    sender: {
      id: message.sender._id,
      name: message.sender.name,
      email: message.sender.email,
      icon: message.sender.icon,
      bonsai: message.sender.bonsai,
    },
    attachments: message.attachments || [],
    reactions: message.reactions || [],
    replyTo: message.replyTo ? {
      id: message.replyTo._id,
      content: message.replyTo.content,
      sender: message.replyTo.sender?.name || "Unknown",
      type: message.replyTo.type,
      createdAt: message.replyTo.createdAt,
    } : null,
    readBy: message.readBy || [],
    isEdited: message.isEdited,
    editedAt: message.editedAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  }
}

// Utility to check if user is online (based on lastSeen)
export function isUserOnline(lastSeen) {
  if (!lastSeen) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return new Date(lastSeen) > fiveMinutesAgo
}

// Utility to format chat for frontend
export function formatChatForFrontend(chat, currentUserId) {
  let chatName = chat.name
  let chatAvatar = chat.avatar
  let otherParticipant = null
  let isOnline = false

  if (chat.type === "direct") {
    otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== currentUserId.toString()
    )
    chatName = otherParticipant?.name || "Unknown User"
    chatAvatar = otherParticipant?.icon === "bonsai" 
      ? "bonsai" 
      : otherParticipant?.icon || null
    isOnline = isUserOnline(otherParticipant?.lastSeen)
  }

  return {
    id: chat._id,
    name: chatName,
    type: chat.type,
    avatar: chatAvatar,
    bonsai: otherParticipant?.bonsai || null,
    lastMessage: chat.lastMessage ? {
      content: chat.lastMessage.content,
      sender: chat.lastMessage.sender?.name || "Unknown",
      createdAt: chat.lastMessage.createdAt,
      type: chat.lastMessage.type,
    } : null,
    lastActivity: chat.lastActivity,
    participants: chat.participants?.length || 0,
    isOnline,
    otherParticipant,
  }
}
