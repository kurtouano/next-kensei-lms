import Chat from "@/models/Chat"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"

/**
 * Creates a direct chat between two users when they become friends
 * @param {String} userId1 - First user's ID
 * @param {String} userId2 - Second user's ID
 * @returns {Object} The created chat or existing chat
 */
export async function createFriendChat(userId1, userId2) {
  try {
    console.log("createFriendChat called with:", { userId1, userId2 })
    
    // Ensure we have valid user IDs
    if (!userId1 || !userId2) {
      throw new Error("Both user IDs are required")
    }

    // Don't create chat with self
    if (userId1.toString() === userId2.toString()) {
      throw new Error("Cannot create chat with yourself")
    }

    // Check if direct chat already exists between these users
    const existingChat = await Chat.findOne({
      type: "direct",
      participants: { $all: [userId1, userId2], $size: 2 },
      isActive: true,
    })

    console.log("Existing chat found:", existingChat)

    if (existingChat) {
      // Chat already exists, return it
      return {
        success: true,
        chat: existingChat,
        message: "Chat already exists",
        isNew: false,
      }
    }

    // Verify both users exist
    const users = await User.find({ _id: { $in: [userId1, userId2] } })
    if (users.length !== 2) {
      throw new Error("One or both users not found")
    }

    // Create new direct chat
    const chat = new Chat({
      type: "direct",
      createdBy: userId1, // The one who initiated the friend request
      participants: [userId1, userId2],
      participantCount: 2,
      isActive: true,
      lastActivity: new Date(),
    })

    await chat.save()
    console.log("Chat saved with ID:", chat._id)

    // Create chat participants for both users
    const chatParticipants = [
      {
        chat: chat._id,
        user: userId1,
        role: "member", // Both are equal members in direct chats
        joinedAt: new Date(),
        lastRead: new Date(),
        notifications: "all",
        isActive: true,
      },
      {
        chat: chat._id,
        user: userId2,
        role: "member",
        joinedAt: new Date(),
        lastRead: new Date(),
        notifications: "all",
        isActive: true,
      },
    ]

    console.log("Creating chat participants:", chatParticipants)
    const participants = await ChatParticipant.insertMany(chatParticipants)
    console.log("Chat participants created:", participants)

    // Populate the chat with user data for response
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: "participants",
        select: "name email icon bonsai lastSeen",
        populate: {
          path: "bonsai",
          select: "level customization",
        },
      })
      .populate("createdBy", "name email")

    return {
      success: true,
      chat: populatedChat,
      message: "Direct chat created successfully",
      isNew: true,
    }
  } catch (error) {
    console.error("Error creating friend chat:", error)
    throw error
  }
}

/**
 * Handles the friend acceptance flow including chat creation
 * @param {String} requesterId - ID of user who sent friend request
 * @param {String} recipientId - ID of user who accepted friend request
 * @returns {Object} Result including chat information
 */
export async function handleFriendAcceptance(requesterId, recipientId) {
  try {
    console.log("handleFriendAcceptance called with:", { requesterId, recipientId })
    
    // Create direct chat between the new friends
    const chatResult = await createFriendChat(requesterId, recipientId)
    
    console.log("Friend acceptance chat result:", chatResult)
    
    // You could also send additional notifications here
    // or trigger other friend-related actions
    
    return {
      success: true,
      chat: chatResult.chat,
      isNewChat: chatResult.isNew,
      message: chatResult.isNew 
        ? "Friend request accepted and chat created!" 
        : "Friend request accepted! Chat already exists.",
    }
  } catch (error) {
    console.error("Error handling friend acceptance:", error)
    // Don't fail the friend acceptance if chat creation fails
    return {
      success: false,
      error: error.message,
      message: "Friend request accepted, but failed to create chat",
    }
  }
}

/**
 * Gets or creates a direct chat between two friends
 * This can be used when users try to message each other from the friends list
 * @param {String} currentUserId - Current user's ID
 * @param {String} friendUserId - Friend's user ID
 * @returns {Object} The chat information
 */
export async function getOrCreateFriendChat(currentUserId, friendUserId) {
  try {
    console.log("getOrCreateFriendChat called with:", { currentUserId, friendUserId })
    
    // First check if they are actually friends
    const Friend = (await import("@/models/Friend")).default
    
    const friendship = await Friend.findOne({
      $or: [
        { requester: currentUserId, recipient: friendUserId, status: "accepted" },
        { requester: friendUserId, recipient: currentUserId, status: "accepted" },
      ],
    })

    console.log("Friendship found:", friendship)

    if (!friendship) {
      throw new Error("Users are not friends")
    }

    // Create or get existing chat
    const chatResult = await createFriendChat(currentUserId, friendUserId)
    console.log("Chat result:", chatResult)
    return chatResult
  } catch (error) {
    console.error("Error getting or creating friend chat:", error)
    throw error
  }
}
