// scripts/migrate-add-random-item-count.js
require('dotenv').config();
const mongoose = require('mongoose');

// Define schemas directly in the script to ensure consistency
const CourseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: [100, "Course title cannot exceed 100 characters"] },
  fullDescription: { type: String, required: true },
  shortDescription: { type: String, required: true, maxlength: [200, "Short description cannot exceed 200 characters"] },
  previewVideoUrl: { type: String, required: true, trim: true },
  level: { type: String, enum: ["N5", "N4", "N3", "N2", "N1"], required: true },
  highlights: [{ description: { type: String } }],
  thumbnail: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  price: { type: Number, default: 0 },
  creditReward: { type: Number, default: 0 },
  randomReward: { type: Boolean, default: false },
  randomItemCount: { type: Number, default: 2, min: 1, max: 2 },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  revenue: { total: { type: Number, default: 0 } },
  enrolledStudents: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  tags: [{ type: String }],
  ratingStats: {
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    distribution: { type: Object, default: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  }
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

async function connectDb() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function migrateRandomItemCount() {
  try {
    await connectDb();
    console.log('🔄 Starting migration: Add randomItemCount to existing courses...');

    // Find courses that don't have randomItemCount field
    const coursesToUpdate = await Course.find({
      $or: [
        { randomItemCount: { $exists: false } },
        { randomItemCount: null }
      ]
    });

    console.log(`📊 Found ${coursesToUpdate.length} courses to update with randomItemCount.`);

    let updatedCount = 0;

    for (const course of coursesToUpdate) {
      try {
        // Set randomItemCount to 2 (default) for existing courses
        await Course.findByIdAndUpdate(course._id, { 
          randomItemCount: 2 
        });
        
        updatedCount++;
        console.log(`✅ Updated course: ${course.title} - randomItemCount: 2`);
      } catch (error) {
        console.error(`❌ Error updating course ${course.title}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📈 Courses updated: ${updatedCount}`);

    // Verification
    const coursesWithoutRandomItemCount = await Course.countDocuments({
      $or: [
        { randomItemCount: { $exists: false } },
        { randomItemCount: null }
      ]
    });

    if (coursesWithoutRandomItemCount === 0) {
      console.log('✅ All courses now have the randomItemCount field!');
    } else {
      console.warn(`⚠️ ${coursesWithoutRandomItemCount} courses still missing randomItemCount.`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateRandomItemCount();
