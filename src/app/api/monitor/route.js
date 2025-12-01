// src/app/api/monitor/route.js - MongoDB Connection Monitor Endpoint
import { NextResponse } from 'next/server';
import monitor from '@/lib/mongoMonitor';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const stats = monitor.getStats();
    
    // Tambahan info untuk debugging
    const detailedStats = {
      ...stats,
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      mongoose: {
        version: mongoose.version,
        modelNames: mongoose.modelNames(),
      },
    };
    
    return NextResponse.json({
      success: true,
      data: detailedStats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Reset statistics (untuk testing)
export async function DELETE() {
  try {
    monitor.reset();
    return NextResponse.json({
      success: true,
      message: 'Monitor stats reset',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
