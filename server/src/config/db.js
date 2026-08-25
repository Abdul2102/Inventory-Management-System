const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If connection is already established and active, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    });
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`Remote MongoDB Connection Error: ${error.message}`);
    // Local fallback attempt
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/stockflow', {
        bufferCommands: false,
      });
      cachedConnection = conn;
      return conn;
    } catch (localError) {
      console.error(`Local MongoDB Connection Error: ${localError.message}`);
      throw localError;
    }
  }
};

module.exports = connectDB;
