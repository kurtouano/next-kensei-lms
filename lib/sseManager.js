// SSE Manager for real-time events
class SSEManager {
  constructor() {
    this.connections = new Map(); // userId -> Set of controllers
  }

  // Add a new SSE connection for a user
  addConnection(userId, controller) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId).add(controller);
  }

  // Remove a connection
  removeConnection(userId, controller) {
    if (this.connections.has(userId)) {
      this.connections.get(userId).delete(controller);
      if (this.connections.get(userId).size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  // Send data to a specific user
  sendToUser(userId, data) {
    if (this.connections.has(userId)) {
      const userConnections = this.connections.get(userId);
      const message = `data: ${JSON.stringify(data)}\n\n`;
      
      userConnections.forEach(controller => {
        try {
          controller.enqueue(message);
        } catch (error) {
          console.error('Error sending SSE message:', error);
          // Remove failed connection
          this.removeConnection(userId, controller);
        }
      });
    }
  }

  // Send data to multiple users
  sendToUsers(userIds, data) {
    userIds.forEach(userId => this.sendToUser(userId, data));
  }

  // Send friend request notification
  sendFriendRequestNotification(recipientId, requesterName) {
    this.sendToUser(recipientId, {
      type: 'friend_request_received',
      message: `${requesterName} sent you a friend request`,
      timestamp: new Date().toISOString()
    });
  }

  // Send friend request accepted notification
  sendFriendAcceptedNotification(requesterId, responderName) {
    this.sendToUser(requesterId, {
      type: 'friend_request_accepted',
      message: `${responderName} accepted your friend request`,
      timestamp: new Date().toISOString()
    });
  }

  // Send friends list update
  sendFriendsUpdate(userId, friends) {
    this.sendToUser(userId, {
      type: 'friends_update',
      friends: friends,
      timestamp: new Date().toISOString()
    });
  }

  // Send online status update
  sendOnlineStatusUpdate(userId, isOnline) {
    this.sendToUser(userId, {
      type: 'online_status_update',
      isOnline: isOnline,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification count update
  sendNotificationCountUpdate(userId, count) {
    this.sendToUser(userId, {
      type: 'notification_count_update',
      count: count,
      timestamp: new Date().toISOString()
    });
  }

  // Send chat count update
  sendChatCountUpdate(userId, count) {
    this.sendToUser(userId, {
      type: 'chat_count_update',
      count: count,
      timestamp: new Date().toISOString()
    });
  }

  // Send new message notification
  sendNewMessageNotification(userId, messageData) {
    this.sendToUser(userId, {
      type: 'new_message',
      message: messageData,
      timestamp: new Date().toISOString()
    });
  }

  // Send online friends count update
  sendOnlineFriendsCountUpdate(userId, count) {
    this.sendToUser(userId, {
      type: 'online_friends_count_update',
      count: count,
      timestamp: new Date().toISOString()
    });
  }

  // Get connection count for a user
  getConnectionCount(userId) {
    return this.connections.has(userId) ? this.connections.get(userId).size : 0;
  }

  // Get total connections
  getTotalConnections() {
    let total = 0;
    this.connections.forEach(connections => {
      total += connections.size;
    });
    return total;
  }
}

// Create singleton instance
const sseManager = new SSEManager();

export default sseManager;
