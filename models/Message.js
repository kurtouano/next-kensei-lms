import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "attachment", "system"],
      default: "text",
    },
    // For images and files
    attachments: [{
      type: {
        type: String,
        enum: ["image", "file", "document", "general"],
      },
      url: String,
      filename: String,
      size: Number, // in bytes
      mimeType: String,
    }],
    // Read receipts - array of user IDs who have read this message
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // For message reactions (future feature)
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // For edited messages
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    // For deleted messages
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
MessageSchema.index({ chat: 1, createdAt: -1 })
MessageSchema.index({ sender: 1 })
MessageSchema.index({ chat: 1, isDeleted: 1, createdAt: -1 })
MessageSchema.index({ "readBy.user": 1 })

export default mongoose.models.Message || mongoose.model("Message", MessageSchema)
