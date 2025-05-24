import mongoose from "mongoose"

const CourseSchema = new mongoose.Schema(
  {
    slug: { // Shortened Link for SEO
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a course title"],
      trim: true,
      maxlength: [100, "Course title cannot exceed 100 characters"],
    },
    fullDescription: {
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
      enum: ["beginner", "intermediate", "advanced"], // n5, n4-n3, n2-n1
      required: true,
    },
    category: {
      type: String,
      enum: ["speaking", "writing", "reading", "listening", "grammar", "vocabulary", "culture"],
      required: true,
      default: "speaking",
    },
    highlights: [ // Course Highlights List such as What you will learn
      {
        description: {
          type: String,
        }
      }
    ],
    thumbnail: {
      type: String,
      required: [true, "Please provide a thumbnail image"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorName: {
      type: String,
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
    itemsReward: [
      {
        item: {
          type: String,
        }
      }
    ],
    modules: [ // Module Schema Ref
      {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Module",
      },
    ],
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
    tags: [
      {
        type: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
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
