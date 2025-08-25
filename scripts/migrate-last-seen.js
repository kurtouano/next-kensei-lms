import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateLastSeen() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Define the User schema for this script
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      lastLogin: Date,
      lastSeen: {
        type: Date,
        default: Date.now,
      }
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Update all users that don't have lastSeen field
    const result = await User.updateMany(
      { lastSeen: { $exists: false } },
      { 
        $set: { 
          lastSeen: new Date() 
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} users with lastSeen field`);

    // For users with lastLogin but no lastSeen, set lastSeen to lastLogin
    const result2 = await User.updateMany(
      { 
        lastLogin: { $exists: true },
        lastSeen: { $exists: true }
      },
      [
        {
          $set: {
            lastSeen: {
              $cond: {
                if: { $eq: ["$lastSeen", new Date()] },
                then: "$lastLogin",
                else: "$lastSeen"
              }
            }
          }
        }
      ]
    );

    console.log(`Updated ${result2.modifiedCount} users with lastLogin as lastSeen`);

    console.log('Migration completed successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateLastSeen();
