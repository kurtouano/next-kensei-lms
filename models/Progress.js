import mongoose from "mongoose"

const ProgressSchema = new mongoose.Schema(
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
    completedLessons: [
      {
        lesson: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        quizScore: {
          type: Number,
          default: 0,
        },
      },
    ],
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    lastAccessedAt: {
      type: Date,
    },
    progress: {
      type: Number, // percentage
      default: 0,
    },
    notes: [
      {
        lesson: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
        },
        content: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Calculate progress percentage before saving
ProgressSchema.pre("save", async function (next) {
  try {
    if (this.isModified("completedLessons")) {
      const Course = mongoose.model("Course")
      const course = await Course.findById(this.course)

      if (course) {
        const totalLessons = course.totalLessons
        const completedCount = this.completedLessons.length

        this.progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

        if (this.progress >= 100) {
          this.isCompleted = true
          this.completedAt = Date.now()
        }
      }
    }
    next()
  } catch (error) {
    next(error)
  }
})

const Progress = mongoose.models.Progress || mongoose.model("Progress", ProgressSchema)

export default Progress
