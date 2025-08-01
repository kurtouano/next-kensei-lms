import mongoose from 'mongoose';

let cachedConnection = null;

export const connectDb = async () => {
  // If we have a cached connection and it's ready, use it
  if (cachedConnection && cachedConnection.readyState === 1) {
    console.log('Using cached connection');
    return cachedConnection;
  }

  try {
    console.log('Creating new connection...');
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedConnection = null;
    throw error;
  }
};