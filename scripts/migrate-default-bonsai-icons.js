// Migration script to set default bonsai icons for users with null icons
// Run with: node scripts/migrate-default-bonsai-icons.js

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
    publishedCourses: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        }
      ],
      validate: {
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

async function migrateDefaultBonsaiIcons() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with null or undefined icons
    const usersWithoutIcons = await User.find({
      $or: [
        { icon: null },
        { icon: undefined },
        { icon: '' }
      ]
    });

    console.log(`📊 Found ${usersWithoutIcons.length} users without icons`);

    if (usersWithoutIcons.length === 0) {
      console.log('✅ No users need icon migration');
      return;
    }

    // Update users to have default bonsai icon
    const updateResult = await User.updateMany(
      {
        $or: [
          { icon: null },
          { icon: undefined },
          { icon: '' }
        ]
      },
      {
        $set: {
          icon: 'bonsai'
        }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} users with default bonsai icon`);

    // Verify the migration
    const usersWithBonsaiIcon = await User.countDocuments({ icon: 'bonsai' });
    console.log(`📊 Total users with bonsai icon: ${usersWithBonsaiIcon}`);

    // Show some examples
    const sampleUsers = await User.find({ icon: 'bonsai' })
      .select('name email icon')
      .limit(5);
    
    console.log('📋 Sample users with bonsai icon:');
    sampleUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the migration
migrateDefaultBonsaiIcons();
