const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  // 1. If connection state is connected (1), return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If connection is already establishing (2), return the active promise
  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  // 3. If disconnected (0), create a new connection handshake promise
  if (!cachedPromise || mongoose.connection.readyState === 0) {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment variables.');
    }

    cachedPromise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Enforce strict query gating
    })
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch(async (error) => {
      cachedPromise = null; // Clear cached promise on failure to allow retry
      console.error(`Remote MongoDB Connection Error: ${error.message}`);
      console.log('Attempting local database connection fallback...');
      
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/stockflow', {
          bufferCommands: false,
        });
        console.log(`MongoDB Connected to local fallback: ${localConn.connection.host}`);
        return localConn;
      } catch (localError) {
        console.error(`Local MongoDB Connection Error: ${localError.message}`);
        throw localError;
      }
    });
  }

  return cachedPromise;
};

module.exports = connectDB;
