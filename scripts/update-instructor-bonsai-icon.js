const mongoose = require('mongoose');
require('dotenv').config();

// Define the User schema directly in the script
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
    banner: {
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
    publishedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
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
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

// Create the User model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function updateInstructorBonsaiIcon() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find instructor users
    const instructors = await User.find({ role: 'instructor' });
    console.log(`📊 Found ${instructors.length} instructor(s)`);

    if (instructors.length > 0) {
      // Update all instructors to have bonsai icon
      const result = await User.updateMany(
        { role: 'instructor' },
        { $set: { icon: 'bonsai' } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} instructor(s) with bonsai icon`);
      
      // Show updated instructors
      const updatedInstructors = await User.find({ role: 'instructor' }).select('name email icon').lean();
      console.log('📋 Updated instructors:');
      updatedInstructors.forEach(instructor => {
        console.log(`  - ${instructor.name} (${instructor.email}) - Icon: ${instructor.icon}`);
      });
    } else {
      console.log('ℹ️ No instructors found to update.');
    }

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

updateInstructorBonsaiIcon();
