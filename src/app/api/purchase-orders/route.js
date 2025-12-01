import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';

// GET /api/purchase-orders
export async function GET() {
  try {
    await connectDB();
    const pos = await PurchaseOrder.find()
      .populate('vendor', 'name email')
      .populate('items.product', 'name sku')
      .sort({ orderDate: -1 });
    return NextResponse.json({ success: true, data: pos });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/purchase-orders
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
    
    const po = await PurchaseOrder.create(body);
    return NextResponse.json(
      { success: true, data: po },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
