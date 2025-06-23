// models/Question.js
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
      maxlength: [1000, "Question cannot exceed 1000 characters"],
      trim: true,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      comment: {
        type: String,
        required: true,
        maxlength: [500, "Comment cannot exceed 500 characters"],
        trim: true,
      },
      likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
      likeCount: {
        type: Number,
        default: 0,
      },
      isInstructorReply: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      }
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
  }
);

// Indexes for better performance
QuestionSchema.index({ courseId: 1, createdAt: -1 });
QuestionSchema.index({ user: 1 });
QuestionSchema.index({ isPinned: -1, createdAt: -1 });
QuestionSchema.index({ likeCount: -1 });
QuestionSchema.index({ "comments.user": 1 });

const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
export default Question;