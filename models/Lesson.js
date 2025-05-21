const LessonSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
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
    description: {
      type: String,
    },
    content: {
      type: String,
      required: [true, "Please provide lesson content"],
    },
    videoUrl: {
      type: String,
      required: [true, "Please provide a video URL"],
    },
    thumbnail: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    moduleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course.modules",
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
        type: {
          type: String,
          enum: ["pdf", "audio", "link", "image", "document"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        fileSize: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)