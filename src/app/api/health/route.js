import { NextResponse } from 'next/server';
import connectDB, { checkConnection } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test koneksi
    await connectDB();
    const isHealthy = await checkConnection();
    
    const responseTime = Date.now() - startTime;
    
    // Ambil info connection pool
    const poolStats = {
      readyState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      activeConnections: mongoose.connection.client?.topology?.s?.pool?.totalConnectionCount || 0,
      availableConnections: mongoose.connection.client?.topology?.s?.pool?.availableConnectionCount || 0,
    };
    
    if (!isHealthy || mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        {
          success: false,
          status: 'unhealthy',
          message: 'Database connection is not healthy',
          responseTime: `${responseTime}ms`,
          poolStats,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      message: 'API and Database are running',
      responseTime: `${responseTime}ms`,
      poolStats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Warmup endpoint untuk prevent cold start
export async function POST() {
  try {
    await connectDB();
    return NextResponse.json({ 
      success: true,
      message: 'Connection warmed up',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
