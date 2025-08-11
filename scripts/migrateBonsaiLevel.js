// scripts/migrateBonsaiLevel.js
// Standalone script to migrate bonsai decorations without Next.js import aliases

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define Bonsai schema locally to avoid import issues
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
      default: 0,
    },
    customization: {
      decorations: mongoose.Schema.Types.Mixed // Allow both array and object types
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Bonsai = mongoose.model('Bonsai', BonsaiSchema);

// Connect to MongoDB
async function connectDb() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set. Please check your .env file.');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Make sure you have a .env file with MONGODB_URI in your project root');
    throw error;
  }
}

async function migrateDecorations() {
  try {
    await connectDb();
    console.log('🔄 Starting decoration migration...');

    // Find all bonsai with array-based decorations
    const bonsaiToMigrate = await Bonsai.find({
      'customization.decorations': { $type: 'array' }
    });

    console.log(`📊 Found ${bonsaiToMigrate.length} bonsai records to migrate`);

    if (bonsaiToMigrate.length === 0) {
      console.log('🎉 No records need migration!');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const bonsai of bonsaiToMigrate) {
      try {
        const oldDecorations = bonsai.customization.decorations || [];
        console.log(`🔧 Migrating bonsai ${bonsai._id} with decorations:`, oldDecorations);

        // Map old decorations to new subcategory structure
        const newDecorations = {
          hats: null,
          ambient: null,
          background: null
        };

        // Simple migration logic based on decoration names
        oldDecorations.forEach(decorationId => {
          if (decorationId.includes('cap') || decorationId.includes('crown') || decorationId.includes('hat')) {
            newDecorations.hats = decorationId;
          } else if (decorationId.includes('ambient') || decorationId.includes('sparkle') || decorationId.includes('firefly')) {
            newDecorations.ambient = decorationId;
          } else if (decorationId.includes('background') || decorationId.includes('sunset') || decorationId.includes('forest')) {
            newDecorations.background = decorationId;
          } else {
            // Default unknown decorations to hats
            if (!newDecorations.hats) {
              newDecorations.hats = decorationId;
            }
          }
        });

        // Update the document using unset and set to avoid type conflicts
        await Bonsai.updateOne(
          { _id: bonsai._id },
          {
            $unset: { 'customization.decorations': '' }
          }
        );

        await Bonsai.updateOne(
          { _id: bonsai._id },
          {
            $set: { 
              'customization.decorations': newDecorations,
              'updatedAt': new Date()
            }
          }
        );

        migratedCount++;
        console.log(`✅ Successfully migrated bonsai ${bonsai._id}`);
        console.log(`   Old: [${oldDecorations.join(', ')}]`);
        console.log(`   New:`, newDecorations);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating bonsai ${bonsai._id}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} records`);
    console.log(`❌ Failed migrations: ${errorCount} records`);
    console.log(`📊 Total processed: ${bonsaiToMigrate.length} records`);

    // Verify migration results
    const remainingArrayDecorations = await Bonsai.countDocuments({
      'customization.decorations': { $type: 'array' }
    });

    const newObjectDecorations = await Bonsai.countDocuments({
      'customization.decorations': { $type: 'object' }
    });

    console.log('\n🔍 Post-migration verification:');
    console.log(`   Remaining array decorations: ${remainingArrayDecorations}`);
    console.log(`   New object decorations: ${newObjectDecorations}`);

    if (remainingArrayDecorations === 0) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('⚠️  Some records still need migration. Please review the errors above.');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
migrateDecorations();