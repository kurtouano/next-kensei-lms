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
      default: 150
    },
    lifetimeCredits: {
      type: Number,
      default: 150
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
          return this.role === "instructor" || this.role === "admin" || courses.length === 0;
        },
        message: "Only instructors and admins can have published courses"
      }
    },
    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    progressRecords: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
    }],
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Define the Bonsai schema
const BonsaiSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalCredits: {
      type: Number,
      default: 150,
    },
    milestones: [
      {
        level: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        creditsRequired: {
          type: Number,
          required: true,
        },
        isAchieved: {
          type: Boolean,
          default: false,
        },
        achievedAt: {
          type: Date,
        },
      },
    ],
    customization: {
      eyes: { type: String, default: 'default_eyes' },
      mouth: { type: String, default: 'default_mouth' },
      foliageColor: { type: String, default: '#77DD82' },
      potStyle: { type: String, default: 'default_pot' },
      potColor: { type: String, default: '#FD9475' },
      groundStyle: { type: String, default: 'default_ground' },
      decorations: {
        hats: { type: String, default: null },
        ambient: { type: String, default: null },
        background: { type: String, default: null }
      }
    },
    ownedItems: [{ type: String }],
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
);

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function migrateLifetimeCredits() {
  try {
    await connectDb();
    
    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Bonsai = mongoose.models.Bonsai || mongoose.model("Bonsai", BonsaiSchema);
    
    console.log('🔄 Starting migration: Add lifetimeCredits field to all users...');
    console.log('📊 New system: credits (spendable) + lifetimeCredits (total earned)');
    console.log('🌳 Bonsai levels now based on lifetimeCredits (never decreases)');
    
    // Find all users without lifetimeCredits field
    const usersToUpdate = await User.find({
      $or: [
        { lifetimeCredits: { $exists: false } },
        { lifetimeCredits: null }
      ]
    });
    
    console.log(`📊 Found ${usersToUpdate.length} users to update`);
    
    let updatedCount = 0;
    let bonsaiUpdatedCount = 0;
    
    for (const user of usersToUpdate) {
      try {
        // Set lifetimeCredits to current credits value (best estimate)
        const lifetimeCredits = user.credits || 150;
        
        // Update user with lifetimeCredits
        await User.findByIdAndUpdate(user._id, { 
          lifetimeCredits: lifetimeCredits 
        });
        updatedCount++;
        
        // Update corresponding bonsai totalCredits to match lifetimeCredits
        const bonsai = await Bonsai.findOne({ userRef: user._id });
        if (bonsai) {
          await Bonsai.findByIdAndUpdate(bonsai._id, { 
            totalCredits: lifetimeCredits 
          });
          bonsaiUpdatedCount++;
        }
        
        console.log(`✅ Updated user: ${user.email} (${user.name}) - Credits: ${user.credits}, Lifetime: ${lifetimeCredits}`);
      } catch (error) {
        console.error(`❌ Error updating user ${user.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`📈 Users updated: ${updatedCount}`);
    console.log(`🌳 Bonsai records updated: ${bonsaiUpdatedCount}`);
    
    // Verify the migration
    const usersWithLifetimeCredits = await User.countDocuments({ 
      lifetimeCredits: { $exists: true, $ne: null } 
    });
    const totalUsers = await User.countDocuments();
    
    console.log(`\n📊 Verification:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with lifetimeCredits: ${usersWithLifetimeCredits}`);
    
    if (usersWithLifetimeCredits === totalUsers) {
      console.log('✅ All users now have lifetimeCredits field!');
    } else {
      console.log('⚠️  Some users may still not have lifetimeCredits field');
    }
    
    console.log('\n🎯 New Credit System:');
    console.log('   • credits: Spendable credits (decreases when purchasing items)');
    console.log('   • lifetimeCredits: Total credits ever earned (never decreases)');
    console.log('   • Bonsai levels: Based on lifetimeCredits (stable progression)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
migrateLifetimeCredits();
