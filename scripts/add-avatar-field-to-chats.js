// Migration script to add avatar field to existing group chats
import { connectDb } from "../lib/mongodb.js"
import Chat from "../models/Chat.js"

async function addAvatarFieldToChats() {
  try {
    console.log("🔄 Starting chat avatar field migration...")
    
    await connectDb()
    
    // Find all group chats that don't have an avatar field
    const groupChats = await Chat.find({ 
      type: "group",
      avatar: { $exists: false }
    })
    
    console.log(`📊 Found ${groupChats.length} group chats without avatar field`)
    
    if (groupChats.length === 0) {
      console.log("✅ All group chats already have avatar field")
      return
    }
    
    // Add avatar field (set to null initially)
    const result = await Chat.updateMany(
      { 
        type: "group",
        avatar: { $exists: false }
      },
      { 
        $set: { avatar: null }
      }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} group chats with avatar field`)
    console.log("🎉 Migration completed successfully!")
    
    // Log the updated chats
    const updatedChats = await Chat.find({ type: "group" }, "name avatar type")
    console.log("📋 Group chats after migration:")
    updatedChats.forEach(chat => {
      console.log(`  - ${chat.name}: avatar = ${chat.avatar || 'null'}`)
    })
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}

// Run the migration
addAvatarFieldToChats()
  .then(() => {
    console.log("🏁 Migration script completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error)
    process.exit(1)
  })
