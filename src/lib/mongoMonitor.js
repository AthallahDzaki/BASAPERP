// src/lib/mongoMonitor.js - MongoDB Connection Monitor
import mongoose from 'mongoose';

class MongoMonitor {
  constructor() {
    this.stats = {
      connects: 0,
      disconnects: 0,
      errors: 0,
      lastError: null,
      lastConnect: null,
      lastDisconnect: null,
    };
    
    this.isMonitoring = false;
  }
  
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    mongoose.connection.on('connected', () => {
      this.stats.connects++;
      this.stats.lastConnect = new Date().toISOString();
      console.log('📊 Monitor: MongoDB connected');
    });
    
    mongoose.connection.on('disconnected', () => {
      this.stats.disconnects++;
      this.stats.lastDisconnect = new Date().toISOString();
      console.log('📊 Monitor: MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      this.stats.errors++;
      this.stats.lastError = {
        message: err.message,
        timestamp: new Date().toISOString(),
      };
      console.error('📊 Monitor: MongoDB error:', err.message);
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('📊 Monitor: MongoDB reconnected');
    });
    
    console.log('📊 MongoDB Monitor started');
  }
  
  getStats() {
    const connection = mongoose.connection;
    
    return {
      ...this.stats,
      currentState: this.getReadyStateText(connection.readyState),
      readyState: connection.readyState,
      host: connection.host,
      name: connection.name,
      poolSize: {
        active: connection.client?.topology?.s?.pool?.totalConnectionCount || 0,
        available: connection.client?.topology?.s?.pool?.availableConnectionCount || 0,
      },
    };
  }
  
  getReadyStateText(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[state] || 'unknown';
  }
  
  reset() {
    this.stats = {
      connects: 0,
      disconnects: 0,
      errors: 0,
      lastError: null,
      lastConnect: null,
      lastDisconnect: null,
    };
  }
}

const monitor = new MongoMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV !== 'production') {
  monitor.start();
}

export default monitor;
