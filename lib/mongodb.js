import mongoose from 'mongoose';

let cachedConnection = null;
let isConnecting = false;

// Enhanced connection function with retry logic
export const connectDb = async (retries = 5, delay = 1000) => {
  // If we have a cached connection and it's ready, use it
  if (cachedConnection && cachedConnection.readyState === 1) {
    console.log('Using cached connection');
    return cachedConnection;
  }

  // If already connecting, wait for it
  if (isConnecting) {
    console.log('Connection in progress, waiting...');
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (cachedConnection && cachedConnection.readyState === 1) {
      return cachedConnection;
    }
  }

  isConnecting = true;
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting MongoDB connection (${attempt}/${retries})...`);
      
      // Enhanced connection options for better reliability
      cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000, // Increased timeout
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000, // Connection timeout
        heartbeatFrequencyMS: 10000, // Heartbeat frequency
        maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
        retryWrites: true,
        retryReads: true,
      });
      
      console.log(`✅ Connected to MongoDB on attempt ${attempt}`);
      isConnecting = false;
      return cachedConnection;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt === retries) {
        isConnecting = false;
        cachedConnection = null;
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts. Last error: ${error.message}`);
      }
      
      // Exponential backoff with jitter
      const backoffDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`⏳ Waiting ${backoffDelay.toFixed(0)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  isConnecting = false;
  throw lastError;
};

// Helper function to check connection health
export const isDbConnected = () => {
  return cachedConnection && cachedConnection.readyState === 1;
};

// Helper function to gracefully disconnect
export const disconnectDb = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('Disconnected from MongoDB');
  }
};

// Connection health monitoring with automatic reconnection
export const ensureDbConnection = async () => {
  if (!isDbConnected()) {
    console.log('🔄 Database connection lost, attempting to reconnect...');
    return await connectDb();
  }
  return cachedConnection;
};