import mongoose from "mongoose"

const ChatParticipantSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "member"],
      default: "member",
    },
    // When the user joined the chat
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    // When the user last read messages in this chat
    lastRead: {
      type: Date,
      default: Date.now,
    },
    // Last message seen by this user
    lastSeenMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // Notification settings for this chat
    notifications: {
      type: String,
      enum: ["all", "mentions", "none"],
      default: "all",
    },
    // Whether user is muted in this chat
    isMuted: {
      type: Boolean,
      default: false,
    },
    mutedUntil: Date,
    // Whether user has left the chat
    isActive: {
      type: Boolean,
      default: true,
    },
    leftAt: Date,
    // Custom nickname in this chat (for groups)
    nickname: {
      type: String,
      trim: true,
      maxlength: [50, "Nickname cannot exceed 50 characters"],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
ChatParticipantSchema.index({ chat: 1, user: 1 }, { unique: true })
ChatParticipantSchema.index({ user: 1, isActive: 1 })
ChatParticipantSchema.index({ chat: 1, isActive: 1 })
ChatParticipantSchema.index({ user: 1, lastRead: -1 })

export default mongoose.models.ChatParticipant || mongoose.model("ChatParticipant", ChatParticipantSchema)
