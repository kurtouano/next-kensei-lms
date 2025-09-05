import mongoose from "mongoose"

const ChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Chat name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      default: "direct",
    },
    avatar: {
      type: String, // URL to chat avatar (for groups)
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For direct chats, we can store participant IDs for quick lookup
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    participantCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
ChatSchema.index({ participants: 1 })
ChatSchema.index({ lastActivity: -1 })
ChatSchema.index({ type: 1, isActive: 1 })
ChatSchema.index({ createdBy: 1 })

// For direct chats, ensure we don't create duplicates
ChatSchema.index(
  { participants: 1, type: 1 },
  { 
    unique: true,
    partialFilterExpression: { type: "direct" }
  }
)

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema)
