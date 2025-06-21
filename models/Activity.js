// models/Activity.js
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // For fast instructor-specific queries
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The student who performed the action
      required: true
    },
    type: {
      type: String,
      enum: [
        "student_enrolled", 
        "course_rated", 
        "course_reviewed", 
        "lesson_completed",
        "course_completed",
        "course_liked" 
      ],
      required: true
    },
    metadata: {
      // For enrollment
      enrollmentPrice: Number,
      
      // For ratings/reviews
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      reviewText: String,
      
      // For lesson completion
      lessonTitle: String,
      moduleTitle: String,
      
      // For course completion
      completionPercentage: Number,
      totalLessons: Number
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true // For sorting by date
    }
  },
  { 
    timestamps: true,
    // TTL index to automatically delete old activities after 90 days
    indexes: [
      { createdAt: 1, expireAfterSeconds: 7776000 } // 90 days
    ]
  }
);

// Compound indexes for efficient queries
ActivitySchema.index({ instructor: 1, createdAt: -1 });
ActivitySchema.index({ course: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });

const Activity = mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
export default Activity;