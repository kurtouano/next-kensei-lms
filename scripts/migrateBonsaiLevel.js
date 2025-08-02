// scripts/migrateBonsaiLevel.js
// Run this script AFTER updating your models

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

const migrateBonsaiLevel = async () => {
  try {
    console.log('🚀 Starting Bonsai level field migration...');
    
    // Connect to database
    await connectDb();
    
    // Get the raw collection (bypassing Mongoose schema)
    const db = mongoose.connection.db;
    const bonsaiCollection = db.collection('bonsais');
    
    // Check how many documents have the level field
    const documentsWithLevel = await bonsaiCollection.countDocuments({ level: { $exists: true } });
    console.log(`📊 Found ${documentsWithLevel} Bonsai documents with 'level' field`);
    
    if (documentsWithLevel === 0) {
      console.log('✅ No documents to migrate. All clean!');
      return;
    }
    
    // Remove the level field from all documents
    const result = await bonsaiCollection.updateMany(
      { level: { $exists: true } }, // Find documents that have level field
      { $unset: { level: "" } }     // Remove the level field
    );
    
    console.log(`✅ Migration completed!`);
    console.log(`   - Documents modified: ${result.modifiedCount}`);
    console.log(`   - Documents matched: ${result.matchedCount}`);
    
    // Verify the migration
    const remainingWithLevel = await bonsaiCollection.countDocuments({ level: { $exists: true } });
    console.log(`📊 Documents still with 'level' field: ${remainingWithLevel}`);
    
    if (remainingWithLevel === 0) {
      console.log('🎉 Migration successful! All level fields removed.');
    } else {
      console.log('⚠️  Some documents still have level field. Check manually.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the migration
migrateBonsaiLevel()
  .then(() => {
    console.log('🏁 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });