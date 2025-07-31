import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "credentials"
      },
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    providerId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    icon: {
      type: String,
    },
    country: {
      type: String,
      default: "Bonsai Garden Resident",
    },
    subscription: {
      type: {
        plan: {
          type: String,
          enum: ["free", "basic", "premium"],
          default: "free",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["active", "expired", "cancelled"],
          default: "active",
        },
      },
    },
    credits: {
      type: Number,
      default: 0
    },
    bonsai: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bonsai",
    },
    publishedCourses: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        }
      ],
      validate: { // Allow published courses only for instructors and admins
        validator: function(courses) {
          if (courses.length > 0 && this.role === "student") {
            return false
          }
          return true
        },
        message: "Only instructors and admins can have published courses"
      }
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    progressRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Progress",
      }
    ],
    lastLogin: {
      type: Date,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

// Instance method to calculate bonsai level based on credits
UserSchema.methods.getBonsaiLevel = function() {
  if (this.credits < 200) return 1;
  if (this.credits < 800) return 2;
  return 3;
}

// Instance method to get next level requirements
UserSchema.methods.getNextLevelInfo = function() {
  const currentLevel = this.getBonsaiLevel();
  
  const levelRequirements = {
    1: { current: 0, next: 200, nextLevel: 2 },
    2: { current: 200, next: 800, nextLevel: 3 },
    3: { current: 800, next: null, nextLevel: null }
  };
  
  return levelRequirements[currentLevel];
}

// Static method to get bonsai level from credits (useful for queries)
UserSchema.statics.getBonsaiLevelFromCredits = function(credits) {
  if (credits < 200) return 1;
  if (credits < 800) return 2;
  return 3;
}

// Single field indexes
UserSchema.index({ provider: 1 })              // Fast login provider checks
UserSchema.index({ role: 1 })                  // Fast role-based queries
UserSchema.index({ lastLogin: -1 })            // Recent login queries (newest first)
UserSchema.index({ credits: -1 })              // Credit-based queries (highest first)

const User = mongoose.models.User || mongoose.model("User", UserSchema)
export default User