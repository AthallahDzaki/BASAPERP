import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BOM from '@/models/BOM';

// GET /api/bom
export async function GET() {
  try {
    await connectDB();
    const boms = await BOM.find({ isActive: true })
      .populate('product', 'name sku')
      .populate('components.component', 'name sku')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: boms });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/bom
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const bom = await BOM.create(body);
    return NextResponse.json(
      { success: true, data: bom },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
