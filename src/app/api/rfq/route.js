import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RFQ from '@/models/RFQ';

// GET /api/rfq
export async function GET() {
  try {
    await connectDB();
    const rfqs = await RFQ.find()
      .populate('vendor', 'name email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: rfqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/rfq
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const rfq = await RFQ.create(body);
    return NextResponse.json(
      { success: true, data: rfq },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
