import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ManufacturingOrder } from '@/models';

// GET /api/manufacturing-orders
export async function GET() {
  try {
    await connectDB();
    const mos = await ManufacturingOrder.find()
      .populate('product', 'name sku')
      .populate('bom')
      .sort({ startDate: -1 });
    return NextResponse.json({ success: true, data: mos });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/manufacturing-orders
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const mo = await ManufacturingOrder.create(body);
    return NextResponse.json(
      { success: true, data: mo },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
