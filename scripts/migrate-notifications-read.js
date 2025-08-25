import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Define the Notification schema for this script
    const notificationSchema = new mongoose.Schema({
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      type: {
        type: String,
        enum: ['friend_request', 'friend_accepted', 'friend_rejected'],
        required: true
      },
      title: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      relatedData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      read: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    });

    const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

    // Update all existing notifications to have read: false
    const result = await Notification.updateMany(
      { read: { $exists: false } },
      { $set: { read: false } }
    );

    console.log(`Updated ${result.modifiedCount} notifications with read field`);
    
    // Mark friend_accepted and friend_rejected notifications as read
    const acceptedRejectedResult = await Notification.updateMany(
      { 
        type: { $in: ['friend_accepted', 'friend_rejected'] },
        read: false
      },
      { $set: { read: true } }
    );

    console.log(`Marked ${acceptedRejectedResult.modifiedCount} accepted/rejected notifications as read`);

    console.log('Migration completed successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateNotifications();
