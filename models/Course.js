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
    highlights: [ 
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShopItem", 
      }
    ],
    modules: [ // Module Schema Ref
      {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Module",
      },
    ],
    revenue: {
      total: {
        type: Number,
        default: 0,
      },
      monthly: [{
        month: {
          type: String,
          required: true,
        }, // "2025-06"
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
        enrollments: {
          type: Number,
          required: true,
          default: 0,
        },
      }],
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    ratingStats: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
      distribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
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
  },
  { timestamps: true },
)

CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ 'revenue.total': -1 });
CourseSchema.index({ enrolledStudents: -1 });
CourseSchema.index({ isPublished: 1 });

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema)
export default Course
