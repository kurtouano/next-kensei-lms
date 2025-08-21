import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique friend relationships
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Update the updatedAt field on save
friendSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get mutual friends count
friendSchema.statics.getMutualFriendsCount = async function(userId1, userId2) {
  try {
    // Get all accepted friends for user1
    const user1Friends = await this.find({
      $or: [
        { requester: userId1, status: 'accepted' },
        { recipient: userId1, status: 'accepted' }
      ]
    });

    // Get all accepted friends for user2
    const user2Friends = await this.find({
      $or: [
        { requester: userId2, status: 'accepted' },
        { recipient: userId2, status: 'accepted' }
      ]
    });

    // Extract friend IDs for user1 (excluding userId1)
    const user1FriendIds = user1Friends.map(friend => {
      if (friend.requester.toString() === userId1) {
        return friend.recipient.toString();
      } else {
        return friend.requester.toString();
      }
    });

    // Extract friend IDs for user2 (excluding userId2)
    const user2FriendIds = user2Friends.map(friend => {
      if (friend.requester.toString() === userId2) {
        return friend.recipient.toString();
      } else {
        return friend.requester.toString();
      }
    });

    // Find common friends
    const mutualFriends = user1FriendIds.filter(friendId => 
      user2FriendIds.includes(friendId)
    );

    return mutualFriends.length;
  } catch (error) {
    console.error('Error calculating mutual friends:', error);
    return 0;
  }
};

const Friend = mongoose.models.Friend || mongoose.model('Friend', friendSchema);

export default Friend;
