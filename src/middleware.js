// src/middleware.js - Rate limiting & security
import { NextResponse } from 'next/server';

// Simple rate limiting (per IP)
const rateLimit = new Map();

export function middleware(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // max 100 requests per minute

  // Cleanup old entries
  if (rateLimit.size > 10000) {
    rateLimit.clear();
  }

  const record = rateLimit.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }

  rateLimit.set(ip, record);

  // Block if exceeded
  if (record.count > maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Apply to API routes only
export const config = {
  matcher: '/api/:path*',
};
