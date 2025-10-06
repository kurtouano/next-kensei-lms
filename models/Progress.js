import mongoose from "mongoose"

const ProgressSchema = new mongoose.Schema( // Individual Progress Record for a User in a Course
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedModules: [
      {
        module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
        completedAt: Date,
        quizScore: { type: Number, default: 0 },
      }
    ],
    lessonProgress: [
      {
        lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        currentTime: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
        completedAt: Date,
      }
    ],
    courseProgress: { 
      type: Number, 
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    rewardData: {
      creditsEarned: { type: Number, default: 0 },
      itemsEarned: [{ 
        id: String,
        name: String,
        image: String
      }],
      courseTitle: String
    },
  },
  { timestamps: true },
)

// Add compound indexes for efficient queries
ProgressSchema.index({ user: 1, course: 1 }, { unique: true })
ProgressSchema.index({ user: 1, isCompleted: 1 });        // For completed courses queries
ProgressSchema.index({ course: 1, isCompleted: 1 });      // For course completion stats
ProgressSchema.index({ user: 1, courseProgress: -1 });    // For progress sorting
ProgressSchema.index({ completedAt: -1 });                // For recent completions
ProgressSchema.index({ user: 1, course: { $in: [] } });   // For my-learning queries (course array lookup)

const Progress = mongoose.models.Progress || mongoose.model("Progress", ProgressSchema)

export default Progress