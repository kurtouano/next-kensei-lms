import { connectDb } from '../lib/mongodb.js';
import User from '../models/User.js';
import Friend from '../models/Friend.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Script to create friends for kurt0216@gmail.com
async function createFriendsForKurt() {
  try {
    console.log('🚀 Starting friend creation script for kurt0216@gmail.com...');
    
    // Connect to database
    await connectDb();
    console.log('✅ Connected to MongoDB');

    // Find the target user (kurt0216@gmail.com)
    const targetUser = await User.findOne({ email: 'kurt0216@gmail.com' });
    
    if (!targetUser) {
      console.error('❌ User kurt0216@gmail.com not found in database');
      return;
    }
    
    console.log(`✅ Found target user: ${targetUser.name} (${targetUser.email})`);

    // Find other users to be friends with (excluding the target user)
    const otherUsers = await User.find({ 
      _id: { $ne: targetUser._id },
      email: { $ne: 'kurt0216@gmail.com' }
    }).limit(15); // Get a few extra in case some already have relationships

    if (otherUsers.length < 10) {
      console.log(`⚠️  Only found ${otherUsers.length} other users. Need at least 10 for friends.`);
      console.log('💡 Consider creating more users first or reducing the friend count.');
      return;
    }

    console.log(`✅ Found ${otherUsers.length} potential friends`);

    // Check existing friend relationships for the target user
    const existingFriends = await Friend.find({
      $or: [
        { requester: targetUser._id, status: 'accepted' },
        { recipient: targetUser._id, status: 'accepted' }
      ]
    });

    const existingFriendIds = existingFriends.map(friend => {
      if (friend.requester.toString() === targetUser._id.toString()) {
        return friend.recipient.toString();
      } else {
        return friend.requester.toString();
      }
    });

    console.log(`📊 Target user already has ${existingFriendIds.length} friends`);

    // Filter out users who are already friends
    const availableUsers = otherUsers.filter(user => 
      !existingFriendIds.includes(user._id.toString())
    );

    console.log(`✅ ${availableUsers.length} users available for new friendships`);

    if (availableUsers.length < 10) {
      console.log(`⚠️  Only ${availableUsers.length} users available for new friendships. Creating friendships with available users.`);
    }

    // Create friend relationships (limit to 10 or available users)
    const usersToFriend = availableUsers.slice(0, 10);
    const friendRelationships = [];

    console.log(`\n🤝 Creating ${usersToFriend.length} friend relationships...`);

    for (let i = 0; i < usersToFriend.length; i++) {
      const friendUser = usersToFriend[i];
      
      try {
        // Create friend relationship with 'accepted' status
        const friendRelationship = new Friend({
          requester: targetUser._id,
          recipient: friendUser._id,
          status: 'accepted',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          updatedAt: new Date()
        });

        await friendRelationship.save();
        friendRelationships.push(friendRelationship);
        
        console.log(`✅ ${i + 1}. Added friend: ${friendUser.name} (${friendUser.email})`);
        
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  ${i + 1}. Friend relationship already exists with: ${friendUser.name}`);
        } else {
          console.error(`❌ ${i + 1}. Error creating friendship with ${friendUser.name}:`, error.message);
        }
      }
    }

    // Verify the results
    const finalFriendCount = await Friend.find({
      $or: [
        { requester: targetUser._id, status: 'accepted' },
        { recipient: targetUser._id, status: 'accepted' }
      ]
    }).countDocuments();

    console.log(`\n🎉 Script completed successfully!`);
    console.log(`📊 ${targetUser.name} now has ${finalFriendCount} friends total`);
    console.log(`✅ Created ${friendRelationships.length} new friend relationships`);

    // Show some friend details
    if (friendRelationships.length > 0) {
      console.log(`\n👥 New friends added:`);
      for (let i = 0; i < Math.min(friendRelationships.length, 5); i++) {
        const friend = friendRelationships[i];
        const friendUser = usersToFriend[i];
        console.log(`   ${i + 1}. ${friendUser.name} (${friendUser.email})`);
      }
      if (friendRelationships.length > 5) {
        console.log(`   ... and ${friendRelationships.length - 5} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error in friend creation script:', error);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the script
createFriendsForKurt();
