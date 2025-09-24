// Test the syntax from the problematic line
const connections = new Map();
connections.set('test', { chatId: 'chat1', userId: 'user1' });

const chatConnections = Array.from(connections.entries()).filter(
  ([_, connection]) => 
    connection.chatId === 'chat1' && 
    connection.userId !== 'user2'
);

console.log('Test passed:', chatConnections);

