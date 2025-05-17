import mongoose from "mongoose"

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a lesson title"],
      trim: true,
      maxlength: [100, "Lesson title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    moduleIndex: {
      type: Number,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
      required: [true, "Please provide lesson content"],
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["pdf", "audio", "link", "image", "document"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    quiz: {
      questions: [
        {
          question: {
            type: String,
            required: true,
          },
          options: [
            {
              text: {
                type: String,
                required: true,
              },
              isCorrect: {
                type: Boolean,
                required: true,
              },
            },
          ],
          explanation: {
            type: String,
          },
        },
      ],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    creditReward: {
      type: Number,
      default: 10,
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

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema)

export default Lesson
