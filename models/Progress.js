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

// Add compound index for efficient queries
ProgressSchema.index({ user: 1, course: 1 }, { unique: true })
ProgressSchema.index({ user: 1, lessonProgress: 1 });

const Progress = mongoose.models.Progress || mongoose.model("Progress", ProgressSchema)

export default Progress