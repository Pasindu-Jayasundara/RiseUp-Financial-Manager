const mongoose = require('mongoose');
const dns = require('dns');

// Set public DNS servers to resolve MongoDB Atlas SRV records cleanly on Windows/ISP networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if environment overrides DNS
}

let isConnected = false;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri && process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
      const user = encodeURIComponent(process.env.MONGODB_USERNAME);
      const pass = encodeURIComponent(process.env.MONGODB_PASSWORD);
      uri = `mongodb+srv://${user}:${pass}@cluster0.i3eqgad.mongodb.net/riseup_db?retryWrites=true&w=majority`;
    }

    if (!uri) {
      uri = 'mongodb://127.0.0.1:27017/riseup_financial_manager';
    }

    // Auto-fix accidental double '@@' in connection string (e.g. password ending with '@')
    if (uri && uri.includes('@@')) {
      uri = uri.replace('@@', '%40@');
    }

    console.log(`Connecting to MongoDB Atlas at: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB connection warning (${error.message}). Server running with fallback mock engine.`);
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
