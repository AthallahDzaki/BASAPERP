import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Quotation } from '@/models';

// GET /api/quotations
export async function GET() {
  try {
    await connectDB();
    const quotations = await Quotation.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name sku')
      .sort({ quotationDate: -1 });
    return NextResponse.json({ success: true, data: quotations });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/quotations
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Calculate totals
    if (body.items && body.items.length > 0) {
      body.items = body.items.map(item => ({
        ...item,
        subtotal: item.quantity * item.unitPrice,
      }));
      body.subtotal = body.items.reduce((sum, item) => sum + item.subtotal, 0);
      body.total = body.subtotal + (body.tax || 0);
    }
    
    const quotation = await Quotation.create(body);
    return NextResponse.json(
      { success: true, data: quotation },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
