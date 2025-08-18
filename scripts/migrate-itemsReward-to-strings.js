// scripts/migrate-itemsReward-to-strings.js
// Migration script to convert itemsReward from ObjectId to String format

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { connectDb } from '../lib/mongodb.js';
import Course from '../models/Course.js';
import { getAllShopItems } from '../components/bonsai/shopItems.js';

async function migrateItemsReward() {
  try {
    // Connect to database
    await connectDb();

    // Get all courses that have itemsReward
    const coursesWithRewards = await Course.find({
      itemsReward: { $exists: true, $ne: [] }
    });

    console.log(`📊 Found ${coursesWithRewards.length} courses with itemsReward`);

    if (coursesWithRewards.length === 0) {
      console.log('✅ No courses need migration');
      return;
    }

    // Get all shop items for reference
    const allShopItems = getAllShopItems();
    const shopItemMap = new Map();
    allShopItems.forEach(item => {
      shopItemMap.set(item.id, item);
    });

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const course of coursesWithRewards) {
      try {
        console.log(`\n📝 Processing course: ${course.title} (${course._id})`);
        
        // Check if itemsReward is already in string format
        const firstItem = course.itemsReward[0];
        if (typeof firstItem === 'string') {
          console.log('⏭️  Already in string format, skipping...');
          skippedCount++;
          continue;
        }

        // Convert ObjectIds to strings
        const newItemsReward = course.itemsReward.map(itemId => {
          // If it's an ObjectId, convert to string
          if (typeof itemId === 'object' && itemId.toString) {
            const itemIdString = itemId.toString();
            console.log(`  🔄 Converting ObjectId: ${itemIdString}`);
            return itemIdString;
          }
          // If it's already a string, keep it
          return itemId;
        });

        // Update the course
        await Course.findByIdAndUpdate(course._id, {
          itemsReward: newItemsReward
        });

        console.log(`  ✅ Updated itemsReward: [${newItemsReward.join(', ')}]`);
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
migrateItemsReward();
