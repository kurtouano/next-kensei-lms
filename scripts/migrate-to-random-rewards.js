// scripts/migrate-to-random-rewards.js
// Migration script to convert itemsReward to randomReward field

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import { connectDb } from '../lib/mongodb.js';
import Course from '../models/Course.js';

async function migrateToRandomRewards() {
  try {
    console.log('🔄 Starting migration to random rewards...');
    
    // Debug: Check if MONGODB_URI is loaded
    console.log('🔍 Checking environment variables...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
    
    // Connect to database
    await connectDb();
    console.log('✅ Connected to database');

    // Get all courses that have itemsReward
    const coursesWithRewards = await Course.find({
      itemsReward: { $exists: true, $ne: [] }
    });

    console.log(`📊 Found ${coursesWithRewards.length} courses with itemsReward`);

    if (coursesWithRewards.length === 0) {
      console.log('✅ No courses need migration');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const course of coursesWithRewards) {
      try {
        console.log(`\n📝 Processing course: ${course.title} (${course._id})`);
        
        // Check if course already has randomReward field
        if (course.randomReward !== undefined) {
          console.log('⏭️  Already has randomReward field, skipping...');
          skippedCount++;
          continue;
        }

        // Convert itemsReward to randomReward
        // If course has itemsReward items, enable randomReward
        const hasItemsReward = course.itemsReward && course.itemsReward.length > 0;
        
        // Update the course
        await Course.findByIdAndUpdate(course._id, {
          $set: {
            randomReward: hasItemsReward
          },
          $unset: {
            itemsReward: 1
          }
        });

        console.log(`  ✅ Updated: randomReward = ${hasItemsReward}, removed itemsReward`);
        migratedCount++;

      } catch (error) {
        console.error(`  ❌ Error processing course ${course._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`  ✅ Successfully migrated: ${migratedCount} courses`);
    console.log(`  ⏭️  Skipped (already migrated): ${skippedCount} courses`);
    console.log(`  ❌ Errors: ${errorCount} courses`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some courses failed to migrate. Check the logs above.');
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateToRandomRewards();
