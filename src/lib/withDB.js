// src/lib/withDB.js - Database middleware untuk API routes
import connectDB from './mongodb';
import { NextResponse } from 'next/server';

/**
 * Higher-order function untuk wrap API route dengan DB connection
 * Otomatis handle connection & error handling
 * 
 * Usage:
 * export const GET = withDB(async (request) => {
 *   // Your code here, DB already connected
 *   const data = await Model.find();
 *   return NextResponse.json({ data });
 * });
 */
export function withDB(handler) {
  return async (request, context) => {
    try {
      // Connect ke MongoDB
      await connectDB();
      
      // Jalankan handler
      const response = await handler(request, context);
      
      return response;
      
    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Handle MongoDB connection errors
      if (error.name === 'MongooseServerSelectionError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Database connection timeout. Please try again.',
            error: 'Connection timeout',
          },
          { status: 503 }
        );
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: Object.values(error.errors).map(e => e.message),
          },
          { status: 400 }
        );
      }
      
      // Generic error
      return NextResponse.json(
        {
          success: false,
          message: error.message || 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper untuk route yang perlu timeout protection
 */
export function withTimeout(handler, timeoutMs = 10000) {
  return withDB(async (request, context) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });
    
    const handlerPromise = handler(request, context);
    
    return Promise.race([handlerPromise, timeoutPromise]);
  });
}

export default withDB;
