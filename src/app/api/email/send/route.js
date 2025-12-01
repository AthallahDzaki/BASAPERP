import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter (configure based on your email provider)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// POST /api/email/send
export async function POST(request) {
  try {
    const { to, subject, html, text, attachments } = await request.json();
    
    // Validate
    if (!to || !subject) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Email not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local' },
        { status: 503 }
      );
    }
    
    const transporter = createTransporter();
    
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments
    });
    
    console.log('Email sent:', info.messageId);
    
    return NextResponse.json({
      success: true,
      data: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      },
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
