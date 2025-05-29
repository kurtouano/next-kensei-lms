import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a lesson title"],
      trim: true,
      maxlength: [100, "Lesson title cannot exceed 100 characters"],
    },
    order: {
      type: Number,
      required: true,
    },
    videoUrl: {
      type: String,
      required: [true, "Please provide a video URL"],
    },
    videoDuration: {
      type: Number,
      required: [true, "Please provide the video duration"],
    },
    currentTime: {
      type: Number,
      default: 0, // Default to 0 seconds
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    moduleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    courseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema)
export default Lesson