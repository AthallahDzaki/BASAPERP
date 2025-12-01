import mongoose from 'mongoose';
import monitor from './mongoMonitor';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_dashboard';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global cache untuk connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    lastUsed: Date.now()
  };
}

// Vercel serverless function timeout handler
const CONNECTION_TIMEOUT = 60000; // 60 detik
let connectionTimer = null;

async function connectDB() {
  // Cek apakah connection masih valid
  if (cached.conn) {
    // Reset timer setiap kali dipakai
    cached.lastUsed = Date.now();
    clearTimeout(connectionTimer);
    
    // Cek status connection
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    
    // Kalau disconnected, reset cache
    console.log('⚠️ MongoDB connection lost, reconnecting...');
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Max 10 connections
      minPoolSize: 2, // Min 2 connections always ready
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
      family: 4, // Use IPv4, skip trying IPv6
      maxIdleTimeMS: 10000, // Close idle connections after 10s
      waitQueueTimeoutMS: 5000, // Max wait time for connection from pool
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected (Pool: min=2, max=10)');
        
        // Start monitoring
        monitor.start();
        
        // Setup connection monitoring
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err);
          cached.conn = null;
          cached.promise = null;
        });
        
        mongoose.connection.on('disconnected', () => {
          console.log('⚠️ MongoDB disconnected');
          cached.conn = null;
          cached.promise = null;
        });
        
        mongoose.connection.on('reconnected', () => {
          console.log('✅ MongoDB reconnected');
        });
        
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    cached.lastUsed = Date.now();
    
    // Set timeout untuk auto-close di production (Vercel serverless)
    if (process.env.NODE_ENV === 'production') {
      clearTimeout(connectionTimer);
      connectionTimer = setTimeout(async () => {
        const idleTime = Date.now() - cached.lastUsed;
        if (idleTime > CONNECTION_TIMEOUT && cached.conn) {
          console.log('⏱️ Closing idle MongoDB connection');
          await mongoose.connection.close();
          cached.conn = null;
          cached.promise = null;
        }
      }, CONNECTION_TIMEOUT);
    }
    
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received: closing MongoDB connection...`);
  try {
    if (cached.conn) {
      await mongoose.connection.close();
      cached.conn = null;
      cached.promise = null;
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB:', error);
  }
  process.exit(0);
};

// Register shutdown handlers
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Health check function
export async function checkConnection() {
  try {
    if (!cached.conn) return false;
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ MongoDB health check failed:', error);
    cached.conn = null;
    cached.promise = null;
    return false;
  }
}

export default connectDB;
