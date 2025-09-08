import mongoose from "mongoose"
import Chat from "../models/Chat.js"
import Message from "../models/Message.js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Direct MongoDB connection
async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }
  
  try {
    await mongoose.connect(uri)
    console.log("✅ Connected to MongoDB")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}

async function fixChatLastActivity() {
  try {
    await connectDb()
    console.log("Connected to database")

    // Get all chats
    const chats = await Chat.find({ isActive: true })
    console.log(`Found ${chats.length} active chats`)

    for (const chat of chats) {
      // Find the most recent message for this chat
      const lastMessage = await Message.findOne({ 
        chat: chat._id, 
        isDeleted: false 
      }).sort({ createdAt: -1 })

      if (lastMessage) {
        // Update the chat's lastActivity to the last message's timestamp
        await Chat.findByIdAndUpdate(chat._id, {
          lastActivity: lastMessage.createdAt,
          lastMessage: lastMessage._id
        })
        console.log(`Updated chat ${chat.name || chat._id} - lastActivity: ${lastMessage.createdAt}`)
      } else {
        // If no messages, use the chat's creation date
        await Chat.findByIdAndUpdate(chat._id, {
          lastActivity: chat.createdAt
        })
        console.log(`Updated chat ${chat.name || chat._id} - lastActivity: ${chat.createdAt} (no messages)`)
      }
    }

    console.log("✅ Successfully updated all chat lastActivity timestamps")
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error fixing chat lastActivity:", error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

fixChatLastActivity()
