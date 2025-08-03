import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Migration to remove old fields that are no longer in the schema
const cleanupOldBonsaiFields = async () => {
  try {
    console.log('🧹 Starting cleanup of old Bonsai fields...');
    const db = mongoose.connection.db;
    const bonsaiCollection = db.collection('bonsais');

    // Fields to remove (old schema fields not in current model)
    const fieldsToRemove = {
      tree: "",
      pot: "",
      level: "",      // This is now a virtual field
      decoration: "",
      inventory: ""
    };

    // First, let's see what we're dealing with
    const sampleDoc = await bonsaiCollection.findOne({});
    console.log('📋 Sample document structure:');
    console.log('Fields present:', Object.keys(sampleDoc || {}));

    // Count documents with old fields
    const oldFieldCounts = {};
    for (const field of Object.keys(fieldsToRemove)) {
      const count = await bonsaiCollection.countDocuments({ [field]: { $exists: true } });
      oldFieldCounts[field] = count;
      console.log(`📊 Documents with '${field}' field: ${count}`);
    }

    // Check if any cleanup is needed
    const totalOldFields = Object.values(oldFieldCounts).reduce((sum, count) => sum + count, 0);
    if (totalOldFields === 0) {
      console.log('✅ No old fields found. Database is already clean!');
      return { removed: 0, errors: 0 };
    }

    console.log(`\n🚀 Removing old fields from ${Object.values(oldFieldCounts).filter(c => c > 0).length} field types...`);

    // Remove all old fields in one operation
    const result = await bonsaiCollection.updateMany(
      {}, // Update all documents
      { $unset: fieldsToRemove }
    );

    console.log(`✅ Old fields cleanup completed!`);
    console.log(`   - Documents modified: ${result.modifiedCount}`);
    console.log(`   - Documents matched: ${result.matchedCount}`);

    // Verify cleanup
    console.log('\n🔍 Verification - checking remaining old fields:');
    let remainingOldFields = 0;
    for (const field of Object.keys(fieldsToRemove)) {
      const remaining = await bonsaiCollection.countDocuments({ [field]: { $exists: true } });
      if (remaining > 0) {
        console.log(`⚠️  '${field}' still exists in ${remaining} documents`);
        remainingOldFields += remaining;
      } else {
        console.log(`✅ '${field}' successfully removed`);
      }
    }

    if (remainingOldFields === 0) {
      console.log('🎉 All old fields successfully removed!');
    } else {
      console.log(`⚠️  ${remainingOldFields} old field instances still remain`);
    }

    // Show a sample of the cleaned document
    const cleanedSample = await bonsaiCollection.findOne({});
    console.log('\n📋 Sample cleaned document structure:');
    console.log('Current fields:', Object.keys(cleanedSample || {}));

    return { removed: result.modifiedCount, errors: remainingOldFields };

  } catch (error) {
    console.error('❌ Old fields cleanup failed:', error);
    throw error;
  }
};

// Main migration function
const runCleanup = async () => {
  try {
    console.log('🧹 Starting Bonsai old fields cleanup...\n');
    
    // Connect to database
    await connectDb();

    // Run cleanup
    console.log('='.repeat(60));
    const result = await cleanupOldBonsaiFields();

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CLEANUP COMPLETED!');
    console.log('📊 Final Summary:');
    console.log(`   Documents cleaned: ${result.removed}`);
    console.log(`   Remaining issues: ${result.errors}`);

    if (result.errors === 0) {
      console.log('✅ Database successfully cleaned! All old fields removed.');
    } else {
      console.log('⚠️  Some old fields still remain. Please review the logs above.');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run cleanup
runCleanup()
  .then(() => {
    console.log('🏁 Cleanup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup script failed:', error);
    process.exit(1);
  });