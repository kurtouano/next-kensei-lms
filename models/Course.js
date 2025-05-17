import mongoose from "mongoose"

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a course title"],
      trim: true,
      maxlength: [100, "Course title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a course description"],
    },
    shortDescription: {
      type: String,
      required: [true, "Please provide a short description"],
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    category: {
      type: String,
      enum: ["speaking", "writing", "reading", "listening", "grammar", "vocabulary", "culture"],
      required: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Please provide a thumbnail image"],
    },
    coverImage: {
      type: String,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    creditReward: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    modules: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        lessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
          },
        ],
      },
    ],
    totalLessons: {
      type: Number,
      default: 0,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        review: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
    isPublished: {
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
    },
  },
  { timestamps: true },
)

// Calculate average rating before saving
CourseSchema.pre("save", function (next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, item) => acc + item.rating, 0) / this.ratings.length
  }
  next()
})

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema)

export default Course
