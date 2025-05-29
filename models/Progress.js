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
        quizScore: { type: Number, default: 0}
      }
    ],
    courseProgress: { // Course Progress Percentage
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
  },
  { timestamps: true },
)

const Progress = mongoose.models.Progress || mongoose.model("Progress", ProgressSchema)

export default Progress
