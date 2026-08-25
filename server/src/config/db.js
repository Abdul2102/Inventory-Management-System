const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If MONGO_URI is missing, throw a clear configuration error
  if (!process.env.MONGO_URI) {
    throw new Error('Database configuration error: MONGO_URI environment variable is missing.');
  }

  // 1. If connection state is connected (1), return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If a connection promise is in progress, await it
  if (cachedConnection) {
    console.log('Awaiting existing database connection handshake...');
    await cachedConnection;
    return mongoose.connection;
  }

  // 3. Otherwise, initiate a new connection promise
  console.log('Initiating new MongoDB connection...');
  cachedConnection = mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false, // Strict command gating
  });

  try {
    await cachedConnection;
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (error) {
    cachedConnection = null; // Clear cached promise on error to allow retry
    console.error(`Remote MongoDB Connection Error: ${error.message}`);
    
    // Fallback to local MongoDB instance
    console.log('Attempting connection to local MongoDB database fallback...');
    try {
      cachedConnection = mongoose.connect('mongodb://127.0.0.1:27017/stockflow', {
        bufferCommands: false,
      });
      await cachedConnection;
      console.log(`MongoDB Connected to local fallback: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (localError) {
      cachedConnection = null;
      console.error(`Local MongoDB Connection Error: ${localError.message}`);
      throw new Error(`Database connection failed: ${localError.message}`);
    }
  }
};

module.exports = connectDB;
