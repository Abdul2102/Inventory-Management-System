const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Remote MongoDB Connection Error: ${error.message}`);
    console.log('Attempting connection to local MongoDB database fallback (127.0.0.1)...');
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/stockflow');
      console.log(`MongoDB Connected to local fallback: ${conn.connection.host}`);
    } catch (localError) {
      console.error(`Local MongoDB Connection Error: ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
